import { MemoryStore, Store, Options, ClientRateLimitInfo } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";
import { db } from "@server/db";
import { sql } from "drizzle-orm";
import config from "@server/lib/config";
import logger from "@server/logger";

class DatabaseStore implements Store {
    windowMs = 60_000;

    async init(options: Options) {
        this.windowMs = options.windowMs ?? this.windowMs;
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS rate_limits (
                key TEXT PRIMARY KEY,
                hits INTEGER NOT NULL,
                reset_at BIGINT NOT NULL
            )
        `);
    }

    async get(key: string): Promise<ClientRateLimitInfo | undefined> {
        const res: any = await db.execute(sql`
            SELECT hits, reset_at FROM rate_limits WHERE key = ${key}
        `);
        const row = res.rows?.[0] ?? res[0];
        if (!row) return undefined;
        if (row.reset_at < Date.now()) {
            await this.resetKey(key);
            return undefined;
        }
        return { totalHits: row.hits, resetTime: new Date(row.reset_at) };
    }

    async increment(key: string): Promise<ClientRateLimitInfo> {
        const now = Date.now();
        const expire = now + this.windowMs;
        const existing: any = await db.execute(sql`
            SELECT hits, reset_at FROM rate_limits WHERE key = ${key}
        `);
        const row = existing.rows?.[0] ?? existing[0];
        if (!row) {
            await db.execute(sql`
                INSERT INTO rate_limits (key, hits, reset_at)
                VALUES (${key}, 1, ${expire})
            `);
            return { totalHits: 1, resetTime: new Date(expire) };
        }

        if (row.reset_at < now) {
            await db.execute(sql`
                UPDATE rate_limits SET hits = 1, reset_at = ${expire} WHERE key = ${key}
            `);
            return { totalHits: 1, resetTime: new Date(expire) };
        }

        const hits = row.hits + 1;
        await db.execute(sql`
            UPDATE rate_limits SET hits = ${hits} WHERE key = ${key}
        `);
        return { totalHits: hits, resetTime: new Date(row.reset_at) };
    }

    async decrement(key: string) {
        await db.execute(sql`
            UPDATE rate_limits SET hits = CASE WHEN hits > 0 THEN hits - 1 ELSE 0 END WHERE key = ${key}
        `);
    }

    async resetKey(key: string) {
        await db.execute(sql`DELETE FROM rate_limits WHERE key = ${key}`);
    }

    async resetAll() {
        await db.execute(sql`DELETE FROM rate_limits`);
    }
}

export function createStore(): Store {
    const raw = config.getRawConfig();

    if (raw.rate_limits?.store === "redis" && raw.redis?.connection_string) {
        const client = createClient({ url: raw.redis.connection_string });
        client.on("error", (err) => logger.error("Redis error", err));
        return new (RedisStore as any)({ sendCommand: (...args: any[]) => client.sendCommand(args) });
    }

    if (raw.rate_limits?.store === "database") {
        return new DatabaseStore();
    }

    return new MemoryStore();
}
