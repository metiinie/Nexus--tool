import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('teams')
@UseGuards(AuthGuard('jwt'))
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Get()
    getMyTeams(@Req() req: any) {
        return this.teamsService.getUserTeams(req.user.id);
    }

    @Post()
    createTeam(@Req() req: any, @Body() body: { name: string }) {
        return this.teamsService.create(req.user.id, body.name);
    }

    @Post('join')
    joinTeam(@Req() req: any, @Body() body: { code: string }) {
        return this.teamsService.join(req.user.id, body.code);
    }

    @Delete(':teamId/leave')
    leaveTeam(@Req() req: any, @Param('teamId') teamId: string) {
        return this.teamsService.leave(req.user.id, teamId);
    }

    @Get(':teamId/members')
    getMembers(@Req() req: any, @Param('teamId') teamId: string) {
        return this.teamsService.getTeamMembers(teamId, req.user.id);
    }

    @Get(':teamId/tasks')
    getTasks(@Req() req: any, @Param('teamId') teamId: string) {
        return this.teamsService.getTeamTasks(teamId, req.user.id);
    }

    @Post(':teamId/tasks')
    createTask(@Req() req: any, @Param('teamId') teamId: string, @Body() body: any) {
        return this.teamsService.createTeamTask(teamId, req.user.id, body);
    }

    @Get(':teamId/activity')
    getActivity(@Req() req: any, @Param('teamId') teamId: string) {
        return this.teamsService.getTeamActivity(teamId, req.user.id);
    }
}
