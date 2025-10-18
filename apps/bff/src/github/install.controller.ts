import { Controller, Get, Res, Inject } from '@nestjs/common';
import { Response } from 'express';
import { GithubService } from './github.service';

@Controller('github')
export class InstallController {
    constructor(@Inject(GithubService) private readonly gh: GithubService) { }

    @Get('install/start')
    start(@Res() res: Response) {
        // 302 to GitHub App installation flow
        res.redirect(302, this.gh.installUrl());
    }

    @Get('installations')
    async list() {
        return this.gh.listInstallations();
    }
}
