import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

const TOKEN_COOKIE = "csrfToken";
const TOKEN_HEADER = "x-csrf-token";

export function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
    // For safe methods just ensure a token cookie is present
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        if (!req.cookies[TOKEN_COOKIE]) {
            const token = crypto.randomBytes(32).toString("hex");
            res.cookie(TOKEN_COOKIE, token, {
                httpOnly: true,
                sameSite: "lax",
                secure: req.protocol === "https",
                path: "/"
            });
        }
        return next();
    }

    const tokenFromCookie = req.cookies[TOKEN_COOKIE];
    const tokenFromHeader = req.headers[TOKEN_HEADER] as string | undefined;

    if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
        return res.status(403).json({ error: "CSRF token missing or invalid" });
    }

    next();
}
