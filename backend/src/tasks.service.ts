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
        // Return tasks where user is creator, assignee, or part of the team
        const userTeams = await (this.prisma.teamMember as any).findMany({
            where: { userId },
            select: { teamId: true }
        });
        const teamIds = userTeams.map((ut: any) => ut.teamId);

        return (this.prisma.task as any).findMany({
            where: {
                OR: [
                    { userId },
                    { assigneeId: userId },
                    { teamId: { in: teamIds } }
                ]
            },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
                user: { select: { id: true, name: true, email: true } },
                team: { select: { id: true, name: true } },
                comments: {
                    where: { type: 'block', resolved: false },
                    take: 1
                },
                _count: { select: { comments: true } }
            },
            orderBy: { order: 'asc' },
        });
    }

    async create(userId: string, data: any) {
        return (this.prisma.task as any).create({
            data: {
                title: data.title,
                description: data.description || '',
                priority: data.priority || 'medium',
                status: data.status || 'todo',
                dueDate: data.dueDate,
                userId,
                teamId: data.teamId || null,
                assigneeId: data.assigneeId || null,
            },
        });
    }

    async update(id: string, userId: string, data: any) {
        // Get current task state with team members
        const task = await (this.prisma.task as any).findUnique({
            where: { id },
            include: {
                team: {
                    include: { members: true }
                }
            }
        });

        if (!task) return null;

        // Permission check: creator, assignee, or any team member can update
        const isCreator = task.userId === userId;
        const isAssignee = task.assigneeId === userId;
        const isTeamMember = task.team?.members.some((m: any) => m.userId === userId);

        if (!isCreator && !isAssignee && !isTeamMember) {
            return null;
        }

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
