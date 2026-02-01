import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GameService } from './game.service';

export interface Achievement {
    id: string;
    key: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    isUnlocked: boolean;
    progress: number;
    target: number;
    unlockedAt?: Date;
    unlockedReason?: string;
    version: number;
}

@Injectable()
export class AchievementService {
    private readonly logger = new Logger(AchievementService.name);

    constructor(
        private prisma: PrismaService,
        private gameService: GameService
    ) { }

    async getAchievements(userId: string): Promise<Achievement[]> {
        this.logger.debug(`Synchronizing achievements for user: ${userId}`);

        // 1. Fetch metadata and user status
        const [definitions, userAchievements, user] = await Promise.all([
            (this.prisma.achievementDefinition as any).findMany(),
            (this.prisma.userAchievement as any).findMany({
                where: { userId },
                include: { achievementDefinition: true }
            }),
            (this.prisma.user as any).findUnique({
                where: { id: userId },
                include: {
                    tasks: { where: { status: 'done' } },
                    habits: { include: { logs: true } }
                }
            })
        ]);

        if (!user) return [];

        const earnedKeys = new Set(userAchievements.map((ua: any) => ua.achievementDefinition.key));
        const tasksCount = user.tasks.length;
        const criticalTasks = user.tasks.filter((t: any) => t.priority === 'critical').length;

        let maxStreak = 0;
        user.habits.forEach((h: any) => {
            const streak = this.gameService.calculateStreak(h.logs);
            if (streak > maxStreak) maxStreak = streak;
        });

        const accountAgeDays = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

        const results: Achievement[] = [];

        for (const def of definitions) {
            let progress = 0;
            let unlockedNow = false;
            let reason = '';

            // Evaluate progress based on key
            // This maps the DSL/Hardcoded keys to logic
            switch (def.key) {
                case 'first_strike':
                    progress = tasksCount;
                    reason = `Neutralized 1st tactical objective: ${user.tasks[0]?.title || 'Initial Ops'}`;
                    break;
                case 'field_agent':
                    progress = tasksCount;
                    reason = `Successfully concluded ${tasksCount} distinct missions.`;
                    break;
                case 'critical_response':
                    progress = criticalTasks;
                    reason = `Handled high-stakes critical priority operational node.`;
                    break;
                case 'neural_sync_basic':
                    progress = maxStreak;
                    reason = `Maintained consistent neural link for ${maxStreak} cycles.`;
                    break;
                case 'neural_sync_elite':
                    progress = maxStreak;
                    reason = `Achieved elite synchronization depth (${maxStreak} days).`;
                    break;
                case 'rank_ascension':
                    progress = user.level;
                    reason = `Ascended to Authority Rank ${user.level} in the hierarchy.`;
                    break;
                case 'vanguard':
                    progress = accountAgeDays;
                    reason = `Veteran link active for ${accountAgeDays} deployment cycles.`;
                    break;
            }

            const isAlreadyEarned = earnedKeys.has(def.key);
            const metTarget = progress >= def.target;

            // Auto-unlock logic
            if (metTarget && !isAlreadyEarned) {
                await (this.prisma.userAchievement as any).create({
                    data: {
                        userId,
                        achievementDefinitionId: def.id,
                        unlockedReason: reason,
                        unlockedAt: new Date()
                    }
                });
                unlockedNow = true;
            }

            const earnedRecord = userAchievements.find((ua: any) => ua.achievementDefinition.key === def.key);

            results.push({
                id: def.id,
                key: def.key,
                title: def.title,
                description: def.description,
                icon: def.icon,
                category: def.category,
                isUnlocked: isAlreadyEarned || unlockedNow,
                progress: Math.min(progress, def.target),
                target: def.target,
                unlockedAt: earnedRecord?.unlockedAt || (unlockedNow ? new Date() : undefined),
                unlockedReason: earnedRecord?.unlockedReason || (unlockedNow ? reason : undefined),
                version: def.version
            });
        }

        return results;
    }
}
