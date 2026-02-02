import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../backend/src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import cookieParser from 'cookie-parser';

const server = express();

let nestApp: any;

export default async (req: any, res: any) => {
    try {
        if (!nestApp) {
            console.log('[Vercel] Initializing NestJS application...');
            const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
            app.setGlobalPrefix('api');
            app.use(cookieParser());
            app.enableCors({
                origin: true,
                credentials: true,
            });
            await app.init();
            nestApp = app;
            console.log('[Vercel] NestJS initialization complete.');
        }

        // Handle the request
        server(req, res);
    } catch (error) {
        console.error('[Vercel] Error during request handling:', error);
        res.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};
