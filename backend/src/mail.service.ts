import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private resend: Resend;
    private readonly fromEmail = 'onboarding@resend.dev';

    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            this.logger.warn('RESEND_API_KEY not found in environment. Mail delivery will fail.');
        }
        this.resend = new Resend(apiKey);
    }

    async sendVerificationEmail(email: string, token: string) {
        const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
        const url = `${baseUrl}/#/verify-email?token=${token}`;
        this.logger.log(`[RESEND] Verification email protocol initiated for ${email}`);
        this.logger.log(`[RESEND] Access URL: ${url}`);

        try {
            await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: 'NEXUS - Verify Your Neural Link',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #030712; color: #f8fafc; border: 1px solid #1e293b; border-radius: 8px;">
                        <h2 style="color: #0ea5e9; text-transform: uppercase; letter-spacing: 2px;">NEURAL LINK PENDING</h2>
                        <p>A new neural connection has been requested for this identity.</p>
                        <div style="margin: 30px 0;">
                            <a href="${url}" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase;">Verify Neural Link</a>
                        </div>
                        <p style="font-size: 12px; color: #64748b;">If you did not request this link, please ignore this transmission.</p>
                    </div>
                `,
            });
        } catch (error) {
            this.logger.error(`Failed to send verification email to ${email}`, error);
        }
    }

    async sendPasswordResetEmail(email: string, token: string) {
        const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
        const url = `${baseUrl}/#/reset-password?token=${token}`;
        this.logger.log(`[RESEND] Password reset protocol initiated for ${email}`);
        this.logger.log(`[RESEND] Reset URL: ${url}`);

        try {
            await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: 'NEXUS - Password Reset Protocol',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #030712; color: #f8fafc; border: 1px solid #1e293b; border-radius: 8px;">
                        <h2 style="color: #f43f5e; text-transform: uppercase; letter-spacing: 2px;">SECURITY OVERRIDE</h2>
                        <p>A password reset has been triggered for your security profile.</p>
                        <div style="margin: 30px 0;">
                            <a href="${url}" style="background: #f43f5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase;">Reset Access Key</a>
                        </div>
                        <p style="font-size: 12px; color: #64748b;">This link will expire in 1 hour.</p>
                    </div>
                `,
            });
        } catch (error) {
            this.logger.error(`Failed to send password reset email to ${email}`, error);
        }
    }

    async sendNotificationEmail(email: string, title: string, message: string) {
        this.logger.log(`[RESEND] Intelligence Alert sent to ${email}: ${title}`);

        try {
            await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: `NEXUS Alert: ${title}`,
                html: `
                    <div style="font-family: monospace; background: #020617; color: #f8fafc; padding: 20px; border: 1px solid #1e293b; border-radius: 8px;">
                        <h2 style="color: #0ea5e9; border-bottom: 1px solid #334155; padding-bottom: 10px;">NEURAL LINK ALERT</h2>
                        <p style="font-size: 16px;">${message}</p>
                        <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;" />
                        <p style="font-size: 10px; color: #64748b; text-transform: uppercase;">Sent via Vanguard Intelligence Engine</p>
                    </div>
                `,
            });
        } catch (error) {
            this.logger.error(`Failed to send notification email to ${email}`, error);
        }
    }
}
