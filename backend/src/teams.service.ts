import { Injectable, ForbiddenException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { NotificationService } from './notification.service';

function generateJoinCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

type SquadRole = 'commander' | 'navigator' | 'operator' | 'observer';

import { GameService } from './game.service';

@Injectable()
export class TeamsService {
    private readonly logger = new Logger(TeamsService.name);

    constructor(
        private prisma: PrismaService,
        private notificationService: NotificationService,
        private gameService: GameService
    ) { }

    private hasPermission(role: string, action: string): boolean {
        const hierarchy: Record<string, string[]> = {
            commander: ['assign', 'comment', 'resolve', 'chat', 'manage'],
            navigator: ['assign', 'comment', 'resolve', 'chat'],
            operator: ['comment', 'chat', 'resolve_own'],
            observer: ['read']
        };
        const permissions = hierarchy[role] || [];
        if (permissions.includes(action)) return true;
        if (action === 'resolve' && permissions.includes('resolve_own')) return true; // Handled specifically in logic
        return false;
    }

    async create(userId: string, name: string) {
        const code = generateJoinCode();
        const team = await (this.prisma.team as any).create({
            data: {
                name,
                code,
                members: {
                    create: {
                        userId,
                        role: 'commander',
                    },
                },
            },
            include: { members: true },
        });
        await this.logActivity(team.id, userId, 'team_created', { name });
        return team;
    }

    async join(userId: string, code: string) {
        const team = await (this.prisma.team as any).findFirst({
            where: { code: code.toUpperCase() },
        });
        if (!team) throw new NotFoundException('Invalid tactical link code');
        const existing = await (this.prisma.teamMember as any).findFirst({
            where: { userId, teamId: team.id },
        });
        if (existing) return team;

        await (this.prisma.teamMember as any).create({
            data: { userId, teamId: team.id, role: 'operator' },
        });
        await this.logActivity(team.id, userId, 'member_joined', {});
        return team;
    }

    async leave(userId: string, teamId: string) {
        const membership = await (this.prisma.teamMember as any).findFirst({
            where: { userId, teamId },
        });
        if (!membership) throw new NotFoundException('Not linked to this squad');
        if (membership.role === 'commander') throw new ForbiddenException('Commanders cannot abandon ship. Transfer command first.');

        await (this.prisma.teamMember as any).delete({ where: { id: membership.id } });
        return { success: true };
    }

    async getUserTeams(userId: string) {
        const memberships = await (this.prisma.teamMember as any).findMany({
            where: { userId },
            include: {
                team: {
                    include: {
                        members: {
                            include: { user: { select: { id: true, name: true, email: true, level: true } } },
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
        const membership = await (this.prisma.teamMember as any).findFirst({ where: { userId, teamId } });
        if (!membership) throw new ForbiddenException('Access denied: Unauthorized squad access');
        return (this.prisma.teamMember as any).findMany({
            where: { teamId },
            include: { user: { select: { id: true, name: true, email: true, xp: true, level: true } } },
        });
    }

    async getTeamTasks(teamId: string, userId: string) {
        const membership = await (this.prisma.teamMember as any).findFirst({ where: { userId, teamId } });
        if (!membership) throw new ForbiddenException('Access denied');
        return (this.prisma.task as any).findMany({
            where: { teamId },
            include: {
                user: { select: { id: true, email: true, name: true } },
                assignee: { select: { id: true, email: true, name: true } },
                comments: {
                    where: { type: 'block', resolved: false },
                    take: 1
                },
                _count: { select: { comments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async createTeamTask(teamId: string, userId: string, data: any) {
        const membership = await (this.prisma.teamMember as any).findFirst({ where: { userId, teamId } });
        if (!membership || !this.hasPermission(membership.role, 'assign')) throw new ForbiddenException('Command clearance required to assign tasks');

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
        await this.logActivity(teamId, userId, 'task_created', { title: data.title });
        return task;
    }

    async assignTeamTask(teamId: string, taskId: string, userId: string, assigneeId: string) {
        const membership = await (this.prisma.teamMember as any).findFirst({ where: { userId, teamId } });
        if (!membership || !this.hasPermission(membership.role, 'assign')) throw new ForbiddenException('Command clearance required');

        const updatedTask = await (this.prisma.task as any).update({
            where: { id: taskId },
            data: { assigneeId },
        });
        await this.logActivity(teamId, userId, 'task_assigned', { taskId, assigneeId });
        return updatedTask;
    }

    // --- ENHANCED COLLABORATION: TACTICAL COMMENTS ---
    async addTeamTaskComment(teamId: string, taskId: string, userId: string, content: string, type: string = 'standard') {
        const membership = await (this.prisma.teamMember as any).findFirst({ where: { userId, teamId } });
        if (!membership || membership.role === 'observer') throw new ForbiddenException('Operational input restricted');

        const comment = await (this.prisma as any).taskComment.create({
            data: { taskId, userId, content, type: type || 'standard' },
            include: { user: { select: { id: true, name: true } } }
        });

        // Trigger notifications for mentions
        await this.handleMentions(content, teamId, userId, taskId);

        await this.logActivity(teamId, userId, 'task_comment', { taskId, intent: type });

        // Award XP for tactical intelligence
        await this.gameService.awardXP(userId, 'task', 10);

        return comment;
    }

    async resolveTaskComment(teamId: string, commentId: string, userId: string) {
        const [membership, comment] = await Promise.all([
            (this.prisma.teamMember as any).findFirst({ where: { userId, teamId } }),
            (this.prisma.taskComment as any).findUnique({ where: { id: commentId }, include: { task: true } })
        ]);

        if (!membership || !comment) throw new NotFoundException('Resource missing');

        const isAuthorized = this.hasPermission(membership.role, 'resolve') ||
            (membership.role === 'operator' && comment.task.assigneeId === userId);

        if (!isAuthorized) throw new ForbiddenException('Resolution clearance denied');

        const updated = await (this.prisma.taskComment as any).update({
            where: { id: commentId },
            data: { resolved: true, resolvedById: userId }
        });

        await this.logActivity(teamId, userId, 'task_resolved', { taskId: comment.taskId, commentId });

        // Award XP for clearing objectives
        await this.gameService.awardXP(userId, 'task', 20);

        return updated;
    }

    async getTaskComments(teamId: string, taskId: string, userId: string) {
        const membership = await (this.prisma as any).teamMember.findFirst({ where: { userId, teamId } });
        if (!membership) throw new ForbiddenException('Access denied');

        return (this.prisma as any).taskComment.findMany({
            where: { taskId },
            include: {
                user: { select: { id: true, name: true, email: true } },
                resolvedBy: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    // --- ENHANCED COLLABORATION: ASYNC SQUAD CHAT ---
    async getSquadChat(teamId: string, userId: string) {
        const membership = await (this.prisma.teamMember as any).findFirst({ where: { userId, teamId } });
        if (!membership) throw new ForbiddenException('Access denied');

        return (this.prisma as any).squadChat.findMany({
            where: { teamId },
            include: { user: { select: { id: true, name: true, level: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }

    async postSquadMessage(teamId: string, userId: string, content: string) {
        const membership = await (this.prisma.teamMember as any).findFirst({ where: { userId, teamId } });
        if (!membership || membership.role === 'observer') throw new ForbiddenException('Communication restricted');

        // Enforcement of "Slow Mode" logic can be added here (e.g. 5s cooldown)
        const lastMsg = await (this.prisma as any).squadChat.findFirst({
            where: { userId, teamId },
            orderBy: { createdAt: 'desc' }
        });

        if (lastMsg && Date.now() - new Date(lastMsg.createdAt).getTime() < 5000) {
            throw new ForbiddenException('Sub-space interference: Rate limit active (5s)');
        }

        const msg = await (this.prisma as any).squadChat.create({
            data: { teamId, userId, content },
            include: { user: { select: { id: true, name: true } } }
        });

        await this.logActivity(teamId, userId, 'chat_message', {});
        return msg;
    }

    private async handleMentions(content: string, teamId: string, actorId: string, taskId: string) {
        const mentions = content.match(/@(\w+)/g);
        if (!mentions) return;

        const actor = await (this.prisma.user as any).findUnique({ where: { id: actorId }, select: { name: true } });

        for (const mention of mentions) {
            const name = mention.substring(1);
            const user = await (this.prisma.user as any).findFirst({
                where: { name: { equals: name, mode: 'insensitive' } }
            });

            if (user) {
                // Check if user is in team
                const isMember = await (this.prisma.teamMember as any).findFirst({
                    where: { userId: user.id, teamId }
                });

                if (isMember) {
                    await (this.prisma as any).notification.create({
                        data: {
                            userId: user.id,
                            type: 'system_alert',
                            title: 'Tactical Mention',
                            message: `${actor.name || 'An operator'} mentioned you in a tactical briefing.`,
                            priority: 'medium',
                            metadata: JSON.stringify({ teamId, taskId, type: 'mention' })
                        }
                    });
                }
            }
        }
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
        const membership = await (this.prisma.teamMember as any).findFirst({ where: { userId, teamId } });
        if (!membership) throw new ForbiddenException('Access denied');

        return (this.prisma.activity as any).findMany({
            where: { teamId },
            include: {
                actor: { select: { id: true, name: true, level: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
}
