import { db } from "@server/db/pg/driver";
import { sql } from "drizzle-orm";

const version = "1.9.0";

export default async function migration() {
    console.log(`Running setup script ${version}...`);

    try {
        await db.execute(sql`
            CREATE TABLE "securityPackRules" (
                "ruleId" serial PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "value" integer,
                "enabled" boolean DEFAULT true NOT NULL
            );
            CREATE TABLE "globalThrottles" (
                "throttleId" serial PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "value" integer NOT NULL
            );
        `);
        console.log(`Migrated database schema`);
    } catch (e) {
        console.log("Unable to migrate database schema");
        throw e;
    }

    console.log(`${version} migration complete`);
}
