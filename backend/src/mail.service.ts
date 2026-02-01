import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        // For demo/dev, we can use a mock or a test account
        // For real production, use actual SMTP settings from env
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.ethereal.email',
            port: Number(process.env.MAIL_PORT) || 587,
            auth: {
                user: process.env.MAIL_USER || 'mock@example.com',
                pass: process.env.MAIL_PASS || 'mock_pass',
            },
        });
    }

    async sendVerificationEmail(email: string, token: string) {
        const url = `http://localhost:5173/#/verify-email?token=${token}`;
        this.logger.log(`[MAIL] Verification email sent to ${email}. Token: ${token}`);
        this.logger.log(`[MAIL] Click here: ${url}`);

        if (process.env.NODE_ENV === 'production') {
            await this.transporter.sendMail({
                to: email,
                subject: 'NEXUS - Verify Your Neural Link',
                html: `<p>A new neural link has been requested. <a href="${url}">Verify Link</a></p>`,
            });
        }
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const url = `http://localhost:5173/#/reset-password?token=${token}`;
        this.logger.log(`[MAIL] Password reset email sent to ${email}. Token: ${token}`);
        this.logger.log(`[MAIL] Click here: ${url}`);

        if (process.env.NODE_ENV === 'production') {
            await this.transporter.sendMail({
                to: email,
                subject: 'NEXUS - Password Reset Protocol',
                html: `<p>A password reset has been triggered. <a href="${url}">Reset Password</a></p>`,
            });
        }
    }

    async sendNotificationEmail(email: string, title: string, message: string) {
        this.logger.log(`[MAIL] Intelligence Alert sent to ${email}: ${title}`);

        if (process.env.NODE_ENV === 'production') {
            await this.transporter.sendMail({
                to: email,
                subject: `NEXUS Alert: ${title}`,
                html: `
                    <div style="font-family: monospace; background: #020617; color: #f8fafc; padding: 20px; border: 1px solid #1e293b;">
                        <h2 style="color: #0ea5e9; border-bottom: 1px solid #334155; padding-bottom: 10px;">NEURAL LINK ALERT</h2>
                        <p style="font-size: 16px;">${message}</p>
                        <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;" />
                        <p style="font-size: 10px; color: #64748b; text-transform: uppercase;">Sent via Vanguard Intelligence Engine</p>
                    </div>
                `,
            });
        }
    }
}
