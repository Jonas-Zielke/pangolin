import { db } from "@server/db/pg/driver";
import { sql } from "drizzle-orm";

const version = "1.8.0";

export default async function migration() {
    console.log(`Running setup script ${version}...`);

    try {
        await db.execute(
            sql`UPDATE "resources" SET "subdomain" = NULL WHERE "subdomain" IS NOT NULL AND "http" = false;`
        );
        console.log(`Updated raw resources`);
    } catch (e) {
        console.log("Unable to update raw resources");
        throw e;
    }

    console.log(`${version} migration complete`);
}
