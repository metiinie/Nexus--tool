import { Injectable, UnauthorizedException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { MailService } from './mail.service';
import { SecurityLogService } from './security-log.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { authenticator } = require('otplib');

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService,
        private securityLogService: SecurityLogService,
    ) { }

    async register(data: any, req?: any) {
        this.logger.log(`Registering new identity: ${data.email}`);
        const existing = await (this.prisma.user as any).findUnique({
            where: { email: data.email },
        });

        if (existing) {
            throw new ConflictException('Identity already registered');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const defaultName = data.email.split('@')[0];
        const finalName = (data.name && data.name.trim() !== '') ? data.name : defaultName;

        const user = await (this.prisma.user as any).create({
            data: {
                email: data.email,
                passwordHash: hashedPassword,
                name: finalName,
                verificationToken,
                verificationExpires,
            },
        });

        await this.mailService.sendVerificationEmail(user.email, verificationToken);
        await this.securityLogService.log(user.id, 'REGISTER', req);

        return { id: user.id, email: user.email, name: user.name };
    }

    async verifyEmail(token: string, req?: any) {
        const user = await (this.prisma.user as any).findFirst({
            where: {
                verificationToken: token,
                verificationExpires: { gt: new Date() }
            }
        });

        if (!user) throw new BadRequestException('Invalid or expired verification token');

        await (this.prisma.user as any).update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
                verificationExpires: null
            }
        });

        await this.securityLogService.log(user.id, 'VERIFY_EMAIL', req);
        return { success: true };
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await (this.prisma.user as any).findFirst({ where: { email } });
        if (user && await bcrypt.compare(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any, req?: any) {
        if (user.twoFactorEnabled) {
            return {
                twoFactorRequired: true,
                userId: user.id,
                email: user.email
            };
        }

        return this.generateSession(user, req);
    }

    async generateSession(user: any, req?: any) {
        this.logger.log(`Generating session for user: ${user.id}`);
        // tokenVersion used for session invalidation
        const payload = {
            email: user.email,
            sub: user.id,
            version: user.tokenVersion || 0
        };

        await this.securityLogService.log(user.id, 'LOGIN', req);

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name || user.email.split('@')[0],
                xp: user.xp,
                level: user.level,
                isVerified: user.isVerified,
                twoFactorEnabled: user.twoFactorEnabled
            }
        };
    }

    async forgotPassword(email: string, req?: any) {
        const user = await (this.prisma.user as any).findUnique({ where: { email } });
        if (!user) return { message: 'If the email exists, a reset link will be sent.' };

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        await (this.prisma.user as any).update({
            where: { id: user.id },
            data: { resetToken, resetExpires }
        });

        await this.mailService.sendPasswordResetEmail(user.email, resetToken);
        await this.securityLogService.log(user.id, 'RESET_REQ', req);

        return { message: 'If the email exists, a reset link will be sent.' };
    }

    async resetPassword(data: any, req?: any) {
        const user = await (this.prisma.user as any).findFirst({
            where: {
                resetToken: data.token,
                resetExpires: { gt: new Date() }
            }
        });

        if (!user) throw new BadRequestException('Invalid or expired reset token');

        const hashedPassword = await bcrypt.hash(data.newPassword, 10);
        await (this.prisma.user as any).update({
            where: { id: user.id },
            data: {
                passwordHash: hashedPassword,
                resetToken: null,
                resetExpires: null,
                tokenVersion: { increment: 1 } // Invalidate other sessions
            }
        });

        await this.securityLogService.log(user.id, 'PWD_RESET', req);
        return { success: true };
    }

    async changePassword(userId: string, data: any, req?: any) {
        const user = await (this.prisma.user as any).findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');

        const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
        if (!isMatch) throw new UnauthorizedException('Invalid current password');

        const newPasswordHash = await bcrypt.hash(data.newPassword, 10);
        await (this.prisma.user as any).update({
            where: { id: userId },
            data: {
                passwordHash: newPasswordHash,
                tokenVersion: { increment: 1 } // Invalidate other sessions
            },
        });

        await this.securityLogService.log(userId, 'PWD_CHANGE', req);
        return { success: true };
    }

    // 2FA Methods
    async setup2FA(userId: string) {
        const secret = authenticator.generateSecret();
        const user = await (this.prisma.user as any).findUnique({ where: { id: userId } });
        const otpauth = authenticator.keyuri(user.email, 'NEXUS', secret);
        const qrCode = await QRCode.toDataURL(otpauth);

        await (this.prisma.user as any).update({
            where: { id: userId },
            data: { twoFactorSecret: secret }
        });

        return { qrCode, secret };
    }

    async enable2FA(userId: string, token: string, req?: any) {
        const user = await (this.prisma.user as any).findUnique({ where: { id: userId } });
        if (!user.twoFactorSecret) throw new BadRequestException('2FA setup not initiated');

        const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
        if (!isValid) throw new BadRequestException('Invalid 2FA token');

        await (this.prisma.user as any).update({
            where: { id: userId },
            data: { twoFactorEnabled: true }
        });

        await this.securityLogService.log(userId, '2FA_ENABLE', req);
        return { success: true };
    }

    async verify2FALogin(userId: string, token: string, req?: any) {
        const user = await (this.prisma.user as any).findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorEnabled) throw new UnauthorizedException();

        const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
        if (!isValid) throw new UnauthorizedException('Invalid 2FA token');

        return this.generateSession(user, req);
    }
}
