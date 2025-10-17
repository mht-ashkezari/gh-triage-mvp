import 'reflect-metadata';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GithubModule } from '../src/github/github.module';
import { GithubService } from '../src/github/github.service';

describe('webhook → persists installation', () => {
    let app: INestApplication;

    const gh = {
        verifyHmac: vi.fn().mockReturnValue(true),
        upsertInstallation: vi.fn().mockResolvedValue(undefined),
        upsertRepos: vi.fn().mockResolvedValue(undefined),
        removeRepos: vi.fn().mockResolvedValue(undefined),
    };

    beforeAll(async () => {
        const mod = await Test.createTestingModule({
            imports: [GithubModule],
        })
            .overrideProvider(GithubService)
            .useValue(gh)
            .compile();

        app = mod.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('calls upsertInstallation on installation.created', async () => {
        const payload = {
            action: 'created',
            installation: { id: 1, account: { login: 'demo', type: 'User' } },
        };

        await request(app.getHttpServer())
            .post('/webhooks/github')
            .set('x-github-event', 'installation')
            .set('x-hub-signature-256', 'sha256=dummy') // verifyHmac mocked true
            .send(payload)
            .expect(200);

        expect(gh.verifyHmac).toHaveBeenCalled();
        expect(gh.upsertInstallation).toHaveBeenCalledWith(payload);
    });
});
