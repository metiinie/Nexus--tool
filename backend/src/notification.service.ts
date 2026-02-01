import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GameService } from './game.service';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        private prisma: PrismaService,
        private gameService: GameService
    ) { }

    async getNotifications(userId: string) {
        // First, check for time-sensitive events and generate them if they don't exist
        await this.detectEvents(userId);

        return (this.prisma as any).notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
    }

    async markAsRead(notificationId: string) {
        return (this.prisma as any).notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });
    }

    async markAllAsRead(userId: string) {
        return (this.prisma as any).notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }

    private async detectEvents(userId: string) {
        this.logger.debug(`Neural Ping Engine: Scanning for high-signal events for user ${userId}`);

        const user = await (this.prisma as any).user.findUnique({
            where: { id: userId },
            include: {
                tasks: { where: { status: { not: 'done' } } },
                habits: { include: { logs: true } }
            }
        });

        if (!user) return;

        // Check preferences
        let prefs = { notifications: true };
        if (user.preferences) {
            try {
                prefs = { ...prefs, ...JSON.parse(user.preferences) };
            } catch (e) { }
        }

        if (!prefs.notifications) {
            this.logger.debug(`Neural Pings disabled for user ${userId}. Skipping detection.`);
            return;
        }

        // 1. Detect Critical Deadlines
        const criticalTasks = user.tasks.filter((t: any) => t.priority === 'critical');
        for (const task of criticalTasks) {
            if (task.dueDate) {
                const hoursLeft = (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60);
                if (hoursLeft > 0 && hoursLeft < 24) {
                    await this.createNotification(userId, 'critical_deadline', {
                        title: 'Critical Objective at Risk',
                        message: `Operational deadline for "${task.title}" is less than 24 hours away.`,
                        priority: 'urgent',
                        metadata: JSON.stringify({ taskId: task.id })
                    });
                }
            }
        }

        // 2. Detect Habit Streaks at Risk
        for (const habit of user.habits) {
            const streak = this.gameService.calculateStreak(habit.logs);
            if (streak >= 3) {
                // Check if already completed today
                const today = new Date().toISOString().split('T')[0];
                const completedToday = habit.logs.some((l: any) => l.date.toISOString().split('T')[0] === today && l.completed);

                if (!completedToday) {
                    await this.createNotification(userId, 'habit_at_risk', {
                        title: 'Neural Pattern Decoupling',
                        message: `Your ${streak}-day streak for "${habit.title}" is at risk of termination.`,
                        priority: 'high',
                        metadata: JSON.stringify({ habitId: habit.id })
                    });
                }
            }
        }
    }

    private async createNotification(userId: string, type: string, data: { title: string, message: string, priority: string, metadata?: string }) {
        // Prevent duplicate recent notifications of the same type and metadata (e.g. same task ID)
        const recent = await (this.prisma as any).notification.findFirst({
            where: {
                userId,
                type,
                metadata: data.metadata,
                createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 12) } // 12 hours
            }
        });

        if (!recent) {
            this.logger.log(`Generating Neural Ping: ${data.title} for user ${userId}`);
            await (this.prisma as any).notification.create({
                data: {
                    userId,
                    type,
                    ...data
                }
            });
        }
    }
}
