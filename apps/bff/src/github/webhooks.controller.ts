import { Controller, Post, Headers, Req, UnauthorizedException, HttpCode, Inject } from '@nestjs/common'; import { Request } from 'express';
import { GithubService } from './github.service';

@Controller('webhooks')
export class GithubWebhookController {
    constructor(@Inject(GithubService) private readonly gh: GithubService) { }

    @Post('github')
    @HttpCode(200)
    async handle(
        @Req() req: Request,
        @Headers('x-hub-signature-256') sig256?: string,
        @Headers('x-github-event') event?: string,
    ) {
        // Use RAW body for HMAC (main.ts sets req.rawBody)
        const raw: Buffer = (req as any).rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
        if (!this.gh.verifyHmac(sig256 ?? '', raw)) {
            throw new UnauthorizedException('bad signature');
        }

        const payload: any = req.body;

        if (event === 'installation') {
            // Persist the installation row
            await this.gh.upsertInstallation(payload);
        } else if (event === 'installation_repositories') {
            const installationId = payload?.installation?.id;
            if (installationId) {
                if (Array.isArray(payload.repositories_added) && payload.repositories_added.length) {
                    await this.gh.upsertRepos(installationId, payload.repositories_added);
                }
                if (Array.isArray(payload.repositories_removed) && payload.repositories_removed.length) {
                    await this.gh.removeRepos(installationId, payload.repositories_removed);
                }
            }
        }

        return { ok: true };
    }
}
