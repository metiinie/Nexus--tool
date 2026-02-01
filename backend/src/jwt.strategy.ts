import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from './prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.['nexus_token'];
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'nexus_super_secret_key_123',
        });
    }

    async validate(payload: any) {
        const user = await (this.prisma.user as any).findFirst({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                name: true,
                xp: true,
                level: true,
                tokenVersion: true
            },
        });

        if (!user || user.tokenVersion !== (payload.version || 0)) {
            throw new UnauthorizedException('Session expired or invalidated by security protocol');
        }
        return user;
    }
}
