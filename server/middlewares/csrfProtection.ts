import { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE_NAME } from "@server/auth/sessions/app";
import {
    CSRF_COOKIE_NAME,
    generateCsrfToken,
    getCsrfToken,
    setCsrfToken
} from "@server/auth/csrf";

export function csrfProtectionMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const sessionToken = req.cookies[SESSION_COOKIE_NAME];
    if (sessionToken) {
        let token = getCsrfToken(sessionToken);
        if (!token) {
            token = generateCsrfToken();
            setCsrfToken(sessionToken, token);
            const isSecure = req.protocol === "https";
            res.cookie(CSRF_COOKIE_NAME, token, {
                httpOnly: false,
                sameSite: "lax",
                secure: isSecure
            });
        }
        if (req.method !== "GET") {
            const headerToken = req.headers["x-csrf-token"];
            if (!headerToken || headerToken !== token) {
                res.status(403).json({
                    error: "CSRF token missing or invalid"
                });
                return;
            }
        }
    }
    next();
}
