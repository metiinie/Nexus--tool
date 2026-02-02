import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../backend/src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import cookieParser from 'cookie-parser';

const server = express();

let nestApp: any;

export default async (req: any, res: any) => {
    if (!nestApp) {
        // We create the app only once
        const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
        app.setGlobalPrefix('api');
        app.use(cookieParser());
        app.enableCors({
            origin: true, // Allow current origin
            credentials: true,
        });
        await app.init();
        nestApp = app;
    }

    // Handle the request
    server(req, res);
};
