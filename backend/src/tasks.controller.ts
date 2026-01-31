import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get()
    findAll(@Req() req: any) {
        return this.tasksService.findAll(req.user.id);
    }

    @Post()
    create(@Req() req: any, @Body() body: any) {
        return this.tasksService.create(req.user.id, body);
    }

    @Patch(':id')
    update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
        return this.tasksService.update(id, req.user.id, body);
    }

    @Delete(':id')
    remove(@Req() req: any, @Param('id') id: string) {
        return this.tasksService.remove(id, req.user.id);
    }
}
