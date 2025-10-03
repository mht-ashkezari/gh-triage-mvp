import "reflect-metadata";
import { Module } from "@nestjs/common";
import { GithubWebhookController } from "./webhooks/github.controller";

@Module({
    controllers: [GithubWebhookController],
})
export class AppModule { }