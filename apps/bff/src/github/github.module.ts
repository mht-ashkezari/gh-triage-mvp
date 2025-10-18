import { Module } from '@nestjs/common';
import { InstallController } from './install.controller';
import { GithubService } from './github.service';
import { GithubWebhookController } from './webhooks.controller';

@Module({
    controllers: [InstallController, GithubWebhookController],
    providers: [GithubService],
    exports: [GithubService],
})
export class GithubModule { }
