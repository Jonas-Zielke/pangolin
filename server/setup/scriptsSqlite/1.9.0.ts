import { APP_PATH } from "@server/lib/consts";
import Database from "better-sqlite3";
import path from "path";

const version = "1.9.0";

export default async function migration() {
    console.log(`Running setup script ${version}...`);

    const location = path.join(APP_PATH, "db", "db.sqlite");
    const db = new Database(location);

    try {
        db.exec(`
            CREATE TABLE 'securityPackRules' (
                'ruleId' integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                'name' text NOT NULL,
                'value' integer,
                'enabled' integer DEFAULT 1 NOT NULL
            );
            CREATE TABLE 'globalThrottles' (
                'throttleId' integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                'name' text NOT NULL,
                'value' integer NOT NULL
            );
        `);
        console.log(`Migrated database schema`);
    } catch (e) {
        console.log("Unable to migrate database schema");
        throw e;
    }

    console.log(`${version} migration complete`);
}
