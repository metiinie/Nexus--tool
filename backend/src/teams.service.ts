import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

function generateJoinCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

@Injectable()
export class TeamsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, name: string) {
        const code = generateJoinCode();

        const team = await (this.prisma.team as any).create({
            data: {
                name,
                code,
                members: {
                    create: {
                        userId,
                        role: 'owner',
                    },
                },
            },
            include: { members: true },
        });

        // Log activity
        await this.logActivity(team.id, userId, 'team_created', { name });

        return team;
    }

    async join(userId: string, code: string) {
        const team = await (this.prisma.team as any).findFirst({
            where: { code: code.toUpperCase() },
        });

        if (!team) {
            throw new NotFoundException('Invalid team code');
        }

        // Check if already a member
        const existing = await (this.prisma.teamMember as any).findFirst({
            where: { userId, teamId: team.id },
        });

        if (existing) {
            return team;
        }

        await (this.prisma.teamMember as any).create({
            data: {
                userId,
                teamId: team.id,
                role: 'member',
            },
        });

        // Log activity
        await this.logActivity(team.id, userId, 'member_joined', {});

        return team;
    }

    async leave(userId: string, teamId: string) {
        const membership = await (this.prisma.teamMember as any).findFirst({
            where: { userId, teamId },
        });

        if (!membership) {
            throw new NotFoundException('Not a member of this team');
        }

        if (membership.role === 'owner') {
            throw new ForbiddenException('Owners cannot leave. Transfer ownership first.');
        }

        await (this.prisma.teamMember as any).delete({
            where: { id: membership.id },
        });

        return { success: true };
    }

    async getUserTeams(userId: string) {
        const memberships = await (this.prisma.teamMember as any).findMany({
            where: { userId },
            include: {
                team: {
                    include: {
                        members: {
                            include: { user: { select: { id: true, email: true, level: true } } },
                        },
                        _count: { select: { tasks: true } },
                    },
                },
            },
        });

        return memberships.map((m: any) => ({
            ...m.team,
            role: m.role,
            memberCount: m.team.members.length,
            taskCount: m.team._count.tasks,
        }));
    }

    async getTeamMembers(teamId: string, userId: string) {
        // Verify user is a member
        const membership = await (this.prisma.teamMember as any).findFirst({
            where: { userId, teamId },
        });

        if (!membership) {
            throw new ForbiddenException('Not a member of this team');
        }

        return (this.prisma.teamMember as any).findMany({
            where: { teamId },
            include: {
                user: { select: { id: true, email: true, xp: true, level: true } },
            },
        });
    }

    async getTeamTasks(teamId: string, userId: string) {
        // Verify user is a member
        const membership = await (this.prisma.teamMember as any).findFirst({
            where: { userId, teamId },
        });

        if (!membership) {
            throw new ForbiddenException('Not a member of this team');
        }

        return (this.prisma.task as any).findMany({
            where: { teamId },
            include: {
                user: { select: { id: true, email: true, name: true } },
                assignee: { select: { id: true, email: true, name: true } },
                _count: { select: { comments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async createTeamTask(teamId: string, userId: string, data: any) {
        // Verify user is a member
        const membership = await (this.prisma.teamMember as any).findFirst({
            where: { userId, teamId },
        });

        if (!membership) {
            throw new ForbiddenException('Not a member of this team');
        }

        const task = await (this.prisma.task as any).create({
            data: {
                title: data.title,
                description: data.description || '',
                priority: data.priority || 'medium',
                status: 'todo',
                userId,
                teamId,
                assigneeId: data.assigneeId || null,
            },
        });

        // Log activity
        await this.logActivity(teamId, userId, 'task_created', { title: data.title });

        return task;
    }

    async assignTeamTask(teamId: string, taskId: string, userId: string, assigneeId: string) {
        // Verify user is a member
        const membership = await (this.prisma.teamMember as any).findFirst({
            where: { userId, teamId },
        });

        if (!membership) {
            throw new ForbiddenException('Not a member of this team');
        }

        // Verify task belongs to team
        const task = await (this.prisma.task as any).findFirst({
            where: { id: taskId, teamId },
        });

        if (!task) {
            throw new NotFoundException('Task not found in this team');
        }

        // Verify assignee is a member of the team
        const assigneeMembership = await (this.prisma.teamMember as any).findFirst({
            where: { userId: assigneeId, teamId },
        });

        if (!assigneeMembership) {
            throw new ForbiddenException('Assignee is not a member of this team');
        }

        const updatedTask = await (this.prisma.task as any).update({
            where: { id: taskId },
            data: { assigneeId },
        });

        await this.logActivity(teamId, userId, 'task_assigned', { taskId, assigneeId, title: task.title });

        return updatedTask;
    }

    async addTeamTaskComment(teamId: string, taskId: string, userId: string, content: string) {
        const membership = await (this.prisma.teamMember as any).findFirst({
            where: { userId, teamId },
        });

        if (!membership) {
            throw new ForbiddenException('Not a member of this team');
        }

        const task = await (this.prisma.task as any).findFirst({
            where: { id: taskId, teamId },
        });

        if (!task) {
            throw new NotFoundException('Task not found in this team');
        }

        const comment = await (this.prisma as any).taskComment.create({
            data: {
                taskId,
                userId,
                content,
            },
        });

        await this.logActivity(teamId, userId, 'task_comment', { taskId, title: task.title });

        return comment;
    }

    async getTaskComments(teamId: string, taskId: string, userId: string) {
        const membership = await (this.prisma as any).teamMember.findFirst({
            where: { userId, teamId },
        });

        if (!membership) {
            throw new ForbiddenException('Not a member of this team');
        }

        return (this.prisma as any).taskComment.findMany({
            where: { taskId },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async logActivity(teamId: string, actorId: string, type: string, metadata: any) {
        return (this.prisma.activity as any).create({
            data: {
                teamId,
                actorId,
                type,
                metadata: JSON.stringify(metadata),
            },
        });
    }

    async getTeamActivity(teamId: string, userId: string, limit = 20) {
        // Verify user is a member
        const membership = await (this.prisma.teamMember as any).findFirst({
            where: { userId, teamId },
        });

        if (!membership) {
            throw new ForbiddenException('Not a member of this team');
        }

        return (this.prisma.activity as any).findMany({
            where: { teamId },
            include: {
                actor: { select: { id: true, email: true, level: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
}
