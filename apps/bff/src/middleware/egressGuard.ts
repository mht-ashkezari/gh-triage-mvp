import { NextFunction, Request, Response } from "express";

export function egressGuard(req: Request, res: Response, next: NextFunction) {
    const allowed = (process.env.ALLOWED_EGRESS_HOSTS || "")
        .split(",")
        .map(h => h.trim().toLowerCase())
        .filter(Boolean);

    const target =
        req.get("x-target-host") ||
        (req.headers["x-target-host"] as string | undefined);

    if (!target) {
        // No header → allow
        return next();
    }

    const normalized = target.trim().toLowerCase();

    if (!allowed.includes(normalized)) {
        return res.status(403).json({ error: `Blocked egress to ${target}` });
    }

    // ✅ allowed host
    return next();
}
