import { Controller, Patch, Body, Param, UseGuards, UnauthorizedException, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from './prisma.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
    constructor(private prisma: PrismaService) { }

    @Patch('achievements/:id')
    async updateAchievement(@Param('id') id: string, @Body() data: any, @Req() req: any) {
        // Strict role validation for achievement metadata modification
        if (req.user.role !== 'admin') {
            throw new UnauthorizedException('Security Breach: Access restricted to Vanguard Admins');
        }

        // Filter and sanitize data to prevent unintended property overwrites
        const updateData: any = {};
        if (data.title) updateData.title = data.title;
        if (data.description) updateData.description = data.description;
        if (data.target !== undefined) updateData.target = Number(data.target);
        if (data.icon) updateData.icon = data.icon;

        return await (this.prisma.achievementDefinition as any).update({
            where: { id },
            data: {
                ...updateData,
                version: { increment: 1 } // Automatic versioning on every definition change
            }
        });
    }
}
