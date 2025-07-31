import { exec } from "child_process";
import util from "util";
import logger from "@server/logger";
import config from "@server/lib/config";

const execAsync = util.promisify(exec);

export async function enableSynFloodProtection() {
    try {
        await execAsync(
            "iptables -A INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 4 -j RETURN"
        );
        logger.info("SYN flood protection enabled");
    } catch (e) {
        logger.warn("Failed to enable SYN flood protection", e);
    }
}

export async function disableSynFloodProtection() {
    try {
        await execAsync(
            "iptables -D INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 4 -j RETURN"
        );
        logger.info("SYN flood protection disabled");
    } catch (e) {
        logger.warn("Failed to disable SYN flood protection", e);
    }
}

export async function setIcmpRateLimit(rate: number) {
    try {
        await execAsync(
            `iptables -A INPUT -p icmp -m limit --limit ${rate}/s -j ACCEPT`
        );
        logger.info(`ICMP rate limited to ${rate}/s`);
    } catch (e) {
        logger.warn("Failed to set ICMP rate limit", e);
    }
}

export async function clearIcmpRateLimit() {
    try {
        await execAsync(
            "iptables -D INPUT -p icmp -m limit --limit 1/s -j ACCEPT"
        );
        logger.info("ICMP rate limiting cleared");
    } catch (e) {
        logger.warn("Failed to clear ICMP rate limit", e);
    }
}

export async function applySecurityPack() {
    const cfg = config.getRawConfig().security_pack || {};
    if (cfg.syn_flood_protection) {
        await enableSynFloodProtection();
    } else {
        await disableSynFloodProtection();
    }

    if (cfg.icmp_rate_limit && cfg.icmp_rate_limit > 0) {
        await setIcmpRateLimit(cfg.icmp_rate_limit);
    } else {
        await clearIcmpRateLimit();
    }
}

export function getSecurityStatus() {
    const cfg = config.getRawConfig().security_pack || {};
    return {
        syn_flood_protection: !!cfg.syn_flood_protection,
        icmp_rate_limit: cfg.icmp_rate_limit ?? 0
    };
}
