import "dotenv/config";
// apps/bff/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import express from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bodyParser: false });

    app.use(express.json({
        verify: (req: any, _res, buf) => { req.rawBody = buf as Buffer; },
    }));
    app.use(express.urlencoded({
        extended: true,
        verify: (req: any, _res, buf) => { req.rawBody = buf as Buffer; },
    }));

    const port = Number(process.env.BFF_PORT ?? process.env.PORT ?? 4100);
    await app.listen(port);
    console.log(`BFF running on http://localhost:${port}`);
}
bootstrap();
