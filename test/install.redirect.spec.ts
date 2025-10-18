beforeAll(() => { process.env.GITHUB_APP_SLUG = 'test-slug'; });
it('302 to GitHub App install', async () => {
    const r = await request(app.getHttpServer()).get('/github/install/start').expect(302);
    expect(r.headers.location).toBe('https://github.com/apps/test-slug/installations/new');
});