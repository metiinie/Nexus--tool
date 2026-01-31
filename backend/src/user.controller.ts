import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { GameService } from './game.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(private readonly gameService: GameService) { }

    @Get('profile')
    async getProfile(@Req() req: any) {
        return this.gameService.getUserProfile(req.user.id);
    }
}
