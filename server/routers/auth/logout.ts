import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import HttpCode from "@server/types/HttpCode";
import response from "@server/lib/response";
import logger from "@server/logger";
import {
    createBlankSessionTokenCookie,
    invalidateSession
} from "@server/auth/sessions/app";
import {
    CSRF_COOKIE_NAME,
    deleteCsrfToken
} from "@server/auth/csrf";
import { SESSION_COOKIE_NAME } from "@server/auth/sessions/app";
import { verifySession } from "@server/auth/sessions/verifySession";
import config from "@server/lib/config";

export async function logout(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    const { user, session } = await verifySession(req);
    if (!user || !session) {
        if (config.getRawConfig().app.log_failed_attempts) {
            logger.info(
                `Log out failed because missing or invalid session. IP: ${req.ip}.`
            );
        }
        return next(
            createHttpError(
                HttpCode.BAD_REQUEST,
                "You must be logged in to sign out"
            )
        );
    }

    try {
        try {
            await invalidateSession(session.sessionId);
        } catch (error) {
            logger.error("Failed to invalidate session", error);
        }

        const isSecure = req.protocol === "https";
        res.setHeader("Set-Cookie", createBlankSessionTokenCookie(isSecure));
        deleteCsrfToken(req.cookies[SESSION_COOKIE_NAME] ?? "");
        res.clearCookie(CSRF_COOKIE_NAME);

        return response<null>(res, {
            data: null,
            success: true,
            error: false,
            message: "Logged out successfully",
            status: HttpCode.OK
        });
    } catch (error) {
        logger.error(error);
        return next(
            createHttpError(HttpCode.INTERNAL_SERVER_ERROR, "Failed to log out")
        );
    }
}
