import { Controller, Post, Body, Res, Get, UseGuards, Req, UnauthorizedException, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() body: any, @Req() req: Request) {
        return this.authService.register(body, req);
    }

    @Post('login')
    async login(@Body() body: any, @Res({ passthrough: true }) res: Response, @Req() req: Request) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const result = await this.authService.login(user, req);

        if ('twoFactorRequired' in result) {
            return result;
        }

        const { access_token, user: userData } = result;

        this.setCookie(res, access_token);
        return userData;
    }

    @Post('2fa/verify')
    async verify2FALogin(@Body() body: any, @Res({ passthrough: true }) res: Response, @Req() req: Request) {
        const result = await this.authService.verify2FALogin(body.userId, body.token, req);
        const { access_token, user: userData } = result;

        this.setCookie(res, access_token);
        return userData;
    }

    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('nexus_token');
        return { success: true };
    }

    @Post('verify-email')
    async verifyEmail(@Body('token') token: string, @Req() req: Request) {
        return this.authService.verifyEmail(token, req);
    }

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string, @Req() req: Request) {
        return this.authService.forgotPassword(email, req);
    }

    @Post('reset-password')
    async resetPassword(@Body() body: any, @Req() req: Request) {
        return this.authService.resetPassword(body, req);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Req() req: any) {
        return req.user;
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('2fa/setup')
    async setup2FA(@Req() req: any) {
        return this.authService.setup2FA(req.user.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('2fa/enable')
    async enable2FA(@Body('token') token: string, @Req() req: any) {
        return this.authService.enable2FA(req.user.id, token, req);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('password')
    async changePassword(@Body() body: any, @Req() req: any) {
        return this.authService.changePassword(req.user.id, body, req);
    }

    private setCookie(res: Response, token: string) {
        res.cookie('nexus_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
}
