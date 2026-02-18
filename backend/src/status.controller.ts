import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('status')
export class StatusController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async getStatus() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                status: 'online',
                database: 'connected',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                status: 'partial_outage',
                database: 'disconnected',
                error: error.message,
                timestamp: new Date().toISOString(),
            };
        }
    }
}
