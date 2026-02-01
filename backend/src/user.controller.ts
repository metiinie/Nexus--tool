import { Controller, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { GameService } from './game.service';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AchievementService } from './achievement.service';
import { NotificationService } from './notification.service';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(
        private readonly gameService: GameService,
        private readonly authService: AuthService,
        private readonly achievementService: AchievementService,
        private readonly notificationService: NotificationService,
    ) { }

    @Get('profile')
    async getProfile(@Req() req: any) {
        return this.gameService.getUserProfile(req.user.id);
    }

    @Get('achievements')
    async getAchievements(@Req() req: any) {
        return this.achievementService.getAchievements(req.user.id);
    }

    @Get('notifications')
    async getNotifications(@Req() req: any) {
        return this.notificationService.getNotifications(req.user.id);
    }

    @Patch('notifications/:id/read')
    async markAsRead(@Req() req: any, @Param('id') id: string) {
        return this.notificationService.markAsRead(id);
    }

    @Patch('notifications/read-all')
    async markAllAsRead(@Req() req: any) {
        return this.notificationService.markAllAsRead(req.user.id);
    }

    @Patch('profile')
    async updateProfile(@Req() req: any, @Body() body: any) {
        return this.gameService.updateProfile(req.user.id, body);
    }

    @Patch('password')
    async changePassword(@Req() req: any, @Body() body: any) {
        return this.authService.changePassword(req.user.id, body);
    }
}
