import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(data: any) {
        this.logger.log(`Registering new identity: ${data.email}`);
        const existing = await (this.prisma.user as any).findUnique({
            where: { email: data.email },
        });

        if (existing) {
            throw new ConflictException('Identity already registered');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Ensure name is never empty in DB
        const defaultName = data.email.split('@')[0];
        const finalName = (data.name && data.name.trim() !== '') ? data.name : defaultName;

        const user = await (this.prisma.user as any).create({
            data: {
                email: data.email,
                passwordHash: hashedPassword,
                name: finalName,
            },
            select: {
                id: true,
                email: true,
                name: true,
                xp: true,
                level: true,
            }
        });

        this.logger.log(`User ${user.id} created successfully`);
        return user;
    }

    async validateUser(email: string, pass: string): Promise<any> {
        this.logger.debug(`Validating credentials for: ${email}`);
        const user = await (this.prisma.user as any).findFirst({ where: { email } });
        if (user && await bcrypt.compare(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        this.logger.log(`Generating session for user: ${user.id}`);
        const payload = { email: user.email, sub: user.id };

        // Ensure name fallback even in login response
        const fallbackName = user.email.split('@')[0];
        const displayName = (user.name && user.name.trim() !== '') ? user.name : fallbackName;

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: displayName,
                xp: user.xp,
                level: user.level,
            }
        };
    }

    async changePassword(userId: string, data: any) {
        this.logger.log(`Password change requested for user: ${userId}`);
        const user = await (this.prisma.user as any).findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');

        const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
        if (!isMatch) throw new UnauthorizedException('Invalid current password');

        const newPasswordHash = await bcrypt.hash(data.newPassword, 10);
        return (this.prisma.user as any).update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
    }
}
