import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GameService } from './game.service';

@Injectable()
export class TasksService {
    constructor(
        private prisma: PrismaService,
        private gameService: GameService,
    ) { }

    async findAll(userId: string) {
        return (this.prisma.task as any).findMany({
            where: { userId },
            orderBy: { order: 'asc' },
        });
    }

    async create(userId: string, data: any) {
        return (this.prisma.task as any).create({
            data: {
                title: data.title,
                priority: data.priority || 'medium',
                status: data.status || 'todo',
                dueDate: data.dueDate,
                userId,
            },
        });
    }

    async update(id: string, userId: string, data: any) {
        // Get current task state
        const task = await (this.prisma.task as any).findFirst({
            where: { id, userId },
        });

        if (!task) return null;

        // Check if task is being completed
        const isCompleting = task.status !== 'done' && data.status === 'done';

        // Update task
        const updated = await (this.prisma.task as any).update({
            where: { id },
            data,
        });

        console.log(`[TaskService] Updated task ${id} for user ${userId}. Status: ${updated.status}`);

        // Award XP on completion (server-side only)
        if (isCompleting) {
            console.log(`[GameService] Awarding XP to user ${userId} for task completion`);
            await this.gameService.awardXP(userId, 'task', 50);
        }

        return updated;
    }

    async remove(id: string, userId: string) {
        return (this.prisma.task as any).deleteMany({
            where: { id, userId },
        });
    }
}
