import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { AuthModule } from './auth.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { UserController } from './user.controller';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { GameService } from './game.service';
import { PrismaService } from './prisma.service';
import { AchievementService } from './achievement.service';
import { NotificationService } from './notification.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
  controllers: [AppController, HealthController, TasksController, HabitsController, UserController, TeamsController, AdminController],
  providers: [AppService, TasksService, HabitsService, TeamsService, GameService, PrismaService, AchievementService, NotificationService],
})
export class AppModule { }
