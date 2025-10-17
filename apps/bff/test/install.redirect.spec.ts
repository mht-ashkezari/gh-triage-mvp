import 'reflect-metadata';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { GithubModule } from '../src/github/github.module';

describe('GET /github/install/start', () => {
    let app: INestApplication;

    beforeAll(async () => {
        // Ensure slug is set before the module is created
        process.env.GITHUB_APP_SLUG = 'unit-test-slug';

        const mod = await Test.createTestingModule({
            imports: [GithubModule],
        }).compile();

        app = mod.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('302 redirects to app install page', async () => {
        const r = await request(app.getHttpServer())
            .get('/github/install/start')
            .expect(302);

        expect(r.header.location).toBe(
            'https://github.com/apps/unit-test-slug/installations/new'
        );
    });
});
