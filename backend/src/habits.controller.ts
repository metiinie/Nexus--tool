import { Controller, Get, Post, Body, Param, UseGuards, Req, Delete } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('habits')
@UseGuards(AuthGuard('jwt'))
export class HabitsController {
    constructor(private readonly habitsService: HabitsService) { }

    @Get()
    findAll(@Req() req: any) {
        return this.habitsService.findAll(req.user.id);
    }

    @Post(':id/toggle')
    toggle(@Req() req: any, @Param('id') id: string, @Body() body: { date: string }) {
        return this.habitsService.toggle(req.user.id, id, body.date);
    }

    @Post()
    create(@Req() req: any, @Body() body: any) {
        return this.habitsService.create(req.user.id, body);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.habitsService.remove(req.user.id, id);
    }
}
