import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GameService } from './game.service';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: 'ops' | 'neural' | 'status';
    isUnlocked: boolean;
    progress?: number;
    target?: number;
    unlockedAt?: Date;
}

@Injectable()
export class AchievementService {
    private readonly logger = new Logger(AchievementService.name);

    constructor(
        private prisma: PrismaService,
        private gameService: GameService
    ) { }

    async getAchievements(userId: string): Promise<Achievement[]> {
        this.logger.debug(`Evaluating achievements for user: ${userId}`);

        // Fetch necessary data for evaluation
        const user = await (this.prisma.user as any).findUnique({
            where: { id: userId },
            include: {
                tasks: { where: { status: 'done' } },
                habits: { include: { logs: true } }
            }
        });

        if (!user) return [];

        const tasksCount = user.tasks.length;
        const criticalTasks = user.tasks.filter((t: any) => t.priority === 'critical').length;

        let maxStreak = 0;
        user.habits.forEach((h: any) => {
            const streak = this.gameService.calculateStreak(h.logs);
            if (streak > maxStreak) maxStreak = streak;
        });

        const accountAgeDays = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

        const definitions: Achievement[] = [
            {
                id: 'first_strike',
                title: 'First Strike',
                description: 'Complete your first tactical operation.',
                icon: 'Zap',
                category: 'ops',
                isUnlocked: tasksCount >= 1,
                progress: Math.min(tasksCount, 1),
                target: 1
            },
            {
                id: 'operation_efficiency',
                title: 'Field Agent',
                description: 'Successfully conclude 10 distinct operations.',
                icon: 'Target',
                category: 'ops',
                isUnlocked: tasksCount >= 10,
                progress: Math.min(tasksCount, 10),
                target: 10
            },
            {
                id: 'critical_response',
                title: 'Crisis Sovereign',
                description: 'Neutralize a Critical priority objective.',
                icon: 'ShieldAlert',
                category: 'ops',
                isUnlocked: criticalTasks >= 1,
                progress: Math.min(criticalTasks, 1),
                target: 1
            },
            {
                id: 'neural_sync_basic',
                title: 'Neural Pulse',
                description: 'Maintain a 3-day synchronization streak.',
                icon: 'Activity',
                category: 'neural',
                isUnlocked: maxStreak >= 3,
                progress: Math.min(maxStreak, 3),
                target: 3
            },
            {
                id: 'neural_sync_elite',
                title: 'Deep State Sync',
                description: 'Maintain a 7-day synchronization streak.',
                icon: 'Cpu',
                category: 'neural',
                isUnlocked: maxStreak >= 7,
                progress: Math.min(maxStreak, 7),
                target: 7
            },
            {
                id: 'rank_ascension',
                title: 'Authority Rank V',
                description: 'Ascend to Level 5 within the Nexus hierarchy.',
                icon: 'Trophy',
                category: 'status',
                isUnlocked: user.level >= 5,
                progress: Math.min(user.level, 5),
                target: 5
            },
            {
                id: 'vanguard',
                title: 'Vanguard Protocol',
                description: 'System link active for over 7 deployment cycles.',
                icon: 'Clock',
                category: 'status',
                isUnlocked: accountAgeDays >= 7,
                progress: Math.min(accountAgeDays, 7),
                target: 7
            }
        ];

        return definitions;
    }
}
