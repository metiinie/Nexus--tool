import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class SecurityLogService {
    constructor(private prisma: PrismaService) { }

    async log(userId: string, event: string, req?: any, metadata?: any) {
        const ip = req?.ip || req?.headers?.['x-forwarded-for'] || 'unknown';
        const userAgent = req?.headers?.['user-agent'] || 'unknown';

        return (this.prisma as any).securityLog.create({
            data: {
                userId,
                event,
                ip,
                userAgent,
                metadata: metadata ? JSON.stringify(metadata) : null,
            },
        });
    }
}
