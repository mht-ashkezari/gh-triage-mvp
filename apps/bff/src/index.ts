import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { makeApp, installationClient } from "./github/octokit.factory";

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

app.get("/healthz", (_req: Request, res: Response) => res.json({ ok: true }));

app.get("/github/installations", async (_req: Request, res: Response) => {
  try {
    const ghApp = makeApp();
    const { data } = await (ghApp as any).octokit.request("GET /app/installations");
    res.json(
      data.map((i: any) => ({
        id: i.id,
        account: i.account?.login,
        target_type: i.target_type
      }))
    );
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/github/installations/:id/repos", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const octo = await installationClient(id);
    const repos: any[] = [];
    let page = 1;
    for (; ;) {
      const { data } = await (octo as any).request("GET /installation/repositories", {
        per_page: 100,
        page
      });
      repos.push(...data.repositories);
      if (repos.length >= (data.total_count ?? repos.length)) break;
      page += 1;
    }
    res.json(
      repos.map((r: any) => ({
        id: r.id,
        full_name: r.full_name,
        private: r.private,
        language: r.language,
        visibility: r.visibility,
        org_login: r.owner?.login
      }))
    );
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

const port = Number(process.env.PORT || 4100);
app.listen(port, () => console.log(`BFF listening on :${port}`));
