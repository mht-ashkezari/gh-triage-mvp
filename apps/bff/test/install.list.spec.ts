import { describe, it, expect } from "vitest";
import { InstallController } from "../src/github/install.controller";

describe("InstallController.list()", () => {
    it("returns installations", async () => {
        const gh = { listInstallations: async () => [{ installation_id: 1 }] } as any;
        const ctrl = new InstallController(gh);
        const out = await ctrl.list();
        expect(out).toEqual([{ installation_id: 1 }]);
    });
});
