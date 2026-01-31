import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GameService } from './game.service';

@Injectable()
export class HabitsService {
    constructor(
        private prisma: PrismaService,
        private gameService: GameService,
    ) { }

    async findAll(userId: string) {
        const habits = await (this.prisma.habit as any).findMany({
            where: { userId },
            include: { logs: true },
        });

        // Enrich habits with derived streaks
        return habits.map((habit: any) => ({
            ...habit,
            streak: this.gameService.calculateStreak(habit.logs),
        }));
    }

    async toggle(userId: string, habitId: string, date: string) {
        // Verify habit belongs to user
        const habit = await (this.prisma.habit as any).findFirst({
            where: { id: habitId, userId },
        });

        if (!habit) return null;

        const isoDate = new Date(date);
        isoDate.setUTCHours(0, 0, 0, 0);

        const existingLog = await (this.prisma.habitLog as any).findFirst({
            where: { habitId, date: isoDate },
        });

        if (existingLog) {
            // Un-completing: NO XP refund (anti-cheat)
            await (this.prisma.habitLog as any).delete({
                where: { id: existingLog.id },
            });
            return { completed: false };
        } else {
            // Completing: Award XP (server-side only)
            await (this.prisma.habitLog as any).create({
                data: { habitId, date: isoDate, completed: true },
            });

            await this.gameService.awardXP(userId, 'habit', 20);
            return { completed: true };
        }
    }

    async create(userId: string, data: any) {
        return (this.prisma.habit as any).create({
            data: {
                title: data.title,
                frequency: data.frequency || 'daily',
                userId,
            },
        });
    }

    async remove(userId: string, habitId: string) {
        return (this.prisma.habit as any).deleteMany({
            where: { id: habitId, userId },
        });
    }
}
