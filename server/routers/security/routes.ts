import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { response as sendResponse } from "@server/lib";
import HttpCode from "@server/types/HttpCode";
import createHttpError from "http-errors";
import logger from "@server/logger";
import { fromError } from "zod-validation-error";
import {
    applySecurityPack,
    getSecurityStatus,
} from "@server/lib/securityPack";

const updateSchema = z
    .object({
        syn_flood_protection: z.boolean().optional(),
        icmp_rate_limit: z.number().int().nonnegative().optional(),
    })
    .strict();

export async function getStatus(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const status = getSecurityStatus();
        return sendResponse(res, {
            data: status,
            success: true,
            error: false,
            message: "Status",
            status: HttpCode.OK,
        });
    } catch (error) {
        logger.error(error);
        return next(createHttpError(HttpCode.INTERNAL_SERVER_ERROR));
    }
}

export async function updateSecurity(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const parsed = updateSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(createHttpError(HttpCode.BAD_REQUEST, fromError(parsed.error)));
        }
        // merge into config raw (in-memory)
        const cfg = {
            ...getSecurityStatus(),
            ...parsed.data,
        };
        // update config in memory
        const raw = require("@server/lib/config").config.getRawConfig();
        raw.security_pack = cfg;
        await applySecurityPack();
        return sendResponse(res, {
            data: cfg,
            success: true,
            error: false,
            message: "Updated",
            status: HttpCode.OK,
        });
    } catch (error) {
        logger.error(error);
        return next(createHttpError(HttpCode.INTERNAL_SERVER_ERROR));
    }
}
