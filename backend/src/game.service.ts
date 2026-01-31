import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';

const XP_PER_TASK = 50;
const XP_PER_HABIT = 20;
const LEVEL_MULTIPLIER = 1.25; // Adjusted for better progression
const BASE_XP_PER_LEVEL = 100;

@Injectable()
export class GameService {
    private readonly logger = new Logger(GameService.name);

    constructor(private prisma: PrismaService) { }

    async awardXP(userId: string, source: 'task' | 'habit', amount: number) {
        this.logger.log(`Awarding ${amount} XP to ${userId} from ${source}`);
        const user = await (this.prisma.user as any).findFirst({ where: { id: userId } });
        if (!user) return null;

        let { xp, level } = user;
        const oldLevel = level;
        xp += amount;

        let nextLevelXP = Math.floor(BASE_XP_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, level - 1));

        while (xp >= nextLevelXP) {
            xp -= nextLevelXP;
            level += 1;
            nextLevelXP = Math.floor(BASE_XP_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, level - 1));
            this.logger.log(`User ${userId} ASCENDED to Level ${level}`);
        }

        await (this.prisma.user as any).update({
            where: { id: userId },
            data: { xp, level },
        });

        if (level > oldLevel) {
            const memberships = await (this.prisma.teamMember as any).findMany({
                where: { userId },
                select: { teamId: true },
            });

            for (const m of memberships) {
                await (this.prisma.activity as any).create({
                    data: {
                        teamId: m.teamId,
                        actorId: userId,
                        type: 'level_up',
                        metadata: JSON.stringify({ level, previousLevel: oldLevel }),
                    },
                });
            }
        }

        return { xp, level, nextLevelXP };
    }

    calculateStreak(logs: { date: Date | string; completed: boolean }[] | any[]): number {
        if (!logs || logs.length === 0) return 0;

        const sorted = logs
            .filter(l => l.completed)
            .map(l => {
                const d = new Date(l.date);
                d.setUTCHours(0, 0, 0, 0);
                return d.getTime();
            })
            .sort((a, b) => b - a);

        if (sorted.length === 0) return 0;

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const todayMs = today.getTime();

        const yesterdayMs = todayMs - 86400000;

        if (sorted[0] !== todayMs && sorted[0] !== yesterdayMs) {
            return 0;
        }

        let streak = 1;
        for (let i = 1; i < sorted.length; i++) {
            const diff = sorted[i - 1] - sorted[i];
            if (diff === 86400000) {
                streak++;
            } else if (diff === 0) {
                continue;
            } else {
                break;
            }
        }
        return streak;
    }

    async getUserProfile(userId: string) {
        this.logger.debug(`Retrieving profile for user: ${userId}`);
        const user = await (this.prisma.user as any).findFirst({
            where: { id: userId },
            select: { id: true, email: true, name: true, xp: true, level: true, createdAt: true },
        });

        if (!user) return null;

        // CRITICAL FIX: Ensure name is NEVER empty/null in the response
        const fallbackName = user.email.split('@')[0];
        const displayName = (user.name && user.name.trim() !== '') ? user.name : fallbackName;

        const nextLevelXP = Math.floor(BASE_XP_PER_LEVEL * Math.pow(LEVEL_MULTIPLIER, user.level - 1));

        return {
            ...user,
            name: displayName,
            nextLevelXP,
        };
    }
}
