import { Controller, Post, Body, Res, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() body: any) {
        return this.authService.register(body);
    }

    @Post('login')
    async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { access_token, user: userData } = await this.authService.login(user);

        res.cookie('nexus_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return userData;
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('nexus_token');
        return { success: true };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Req() req: any) {
        return req.user;
    }
}
