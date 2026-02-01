import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GameService } from './game.service';
import { MailService } from './mail.service';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        private prisma: PrismaService,
        private gameService: GameService,
        private mailService: MailService
    ) { }

    async getAudit(userId: string) {
        return (this.prisma as any).notificationAudit.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
    }

    async getNotifications(userId: string) {
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
        const user = await (this.prisma as any).user.findUnique({
            where: { id: userId },
            include: {
                tasks: { where: { status: { not: 'done' } } },
                habits: { include: { logs: true } }
            }
        });

        if (!user) return;

        // 1. Check Deadlines
        const criticalTasks = user.tasks.filter((t: any) => t.priority === 'critical');
        for (const task of criticalTasks) {
            if (task.dueDate) {
                const hoursLeft = (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60);
                if (hoursLeft > 0 && hoursLeft < 24) {
                    await this.dispatch(user, 'critical_deadline', {
                        title: 'Critical Objective at Risk',
                        message: `Operational deadline for "${task.title}" is less than 24 hours away.`,
                        priority: 'urgent',
                        metadata: JSON.stringify({ taskId: task.id })
                    });
                }
            }
        }

        // 2. Check Habts
        for (const habit of user.habits) {
            const streak = this.gameService.calculateStreak(habit.logs);
            if (streak >= 3) {
                const today = new Date().toISOString().split('T')[0];
                const completedToday = habit.logs.some((l: any) => l.date.toISOString().split('T')[0] === today && l.completed);
                if (!completedToday) {
                    await this.dispatch(user, 'habit_at_risk', {
                        title: 'Neural Pattern Decoupling',
                        message: `Your ${streak}-day streak for "${habit.title}" is at risk.`,
                        priority: 'high',
                        metadata: JSON.stringify({ habitId: habit.id })
                    });
                }
            }
        }
    }

    private async dispatch(user: any, type: string, data: any) {
        const userId = user.id;

        // A. Suppress if within 2 hour cooldown for same type/metadata
        const cooldown = 1000 * 60 * 60 * 2;
        const recent = await (this.prisma as any).notificationAudit.findFirst({
            where: {
                userId,
                type,
                createdAt: { gte: new Date(Date.now() - cooldown) }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (recent && recent.channel !== 'suppressed') {
            return; // Already dispatched recently
        }

        // B. Check Quiet Hours
        let quietHours = { enabled: false, start: '22:00', end: '08:00' };
        try {
            if (user.quietHours) quietHours = { ...quietHours, ...JSON.parse(user.quietHours) };
        } catch (e) { }

        const isQuiet = this.isInQuietHours(quietHours);
        const canEscalate = data.priority === 'urgent';

        // C. Check Prefs
        let prefs: Record<string, string[]> = {
            'critical_deadline': ['in_app', 'email'],
            'habit_at_risk': ['in_app'],
            'system_alert': ['in_app']
        };
        try {
            if (user.notificationPrefs) prefs = { ...prefs, ...JSON.parse(user.notificationPrefs) };
        } catch (e) { }

        const channels = prefs[type] || ['in_app'];

        // D. Execution Logic
        for (const channel of channels) {
            let status = 'delivered';
            let reason = 'delivered';

            if (isQuiet && !canEscalate) {
                status = 'suppressed';
                reason = 'quiet_hours';
            }

            if (status === 'delivered') {
                if (channel === 'in_app') {
                    // Check duplicate in Notification table
                    const existing = await (this.prisma as any).notification.findFirst({
                        where: { userId, type, metadata: data.metadata, isRead: false }
                    });
                    if (!existing) {
                        await (this.prisma as any).notification.create({
                            data: { userId, type, ...data }
                        });
                    }
                } else if (channel === 'email') {
                    await this.mailService.sendNotificationEmail(user.email, data.title, data.message);
                }
            }

            // Log Audit
            await (this.prisma as any).notificationAudit.create({
                data: {
                    userId,
                    type,
                    channel: status === 'suppressed' ? 'suppressed' : channel,
                    reason: status === 'suppressed' ? reason : 'dispatched'
                }
            });
        }
    }

    private isInQuietHours(qh: any): boolean {
        if (!qh.enabled) return false;
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (qh.start <= qh.end) {
            return currentTime >= qh.start && currentTime <= qh.end;
        } else {
            // Over midnight
            return currentTime >= qh.start || currentTime <= qh.end;
        }
    }
}
