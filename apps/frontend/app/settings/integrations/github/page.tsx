export default function GithubIntegrationPage() {
    const start = () => { window.location.href = "/github/install/start"; };
    return (
        <main className="p-6">
            <h1 className="text-xl font-semibold mb-2">GitHub Integration</h1>
            <p className="mb-4">Connect your organization’s repositories via a GitHub App.</p>
            <button onClick={start} className="px-4 py-2 rounded bg-black text-white">Connect GitHub</button>
        </main>
    );
}
