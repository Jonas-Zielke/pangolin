import { db } from "@server/db/pg/driver";
import { sql } from "drizzle-orm";

const version = "1.8.0";

export default async function migration() {
    console.log(`Running setup script ${version}...`);

    await db.execute(sql`ALTER TABLE "exitNodes" ADD COLUMN "tags" varchar[];`);

    console.log(`${version} migration complete`);
}
