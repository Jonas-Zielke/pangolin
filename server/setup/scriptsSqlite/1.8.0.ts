import { APP_PATH } from "@server/lib/consts";
import Database from "better-sqlite3";
import path from "path";

const version = "1.8.0";

export default async function migration() {
    console.log(`Running setup script ${version}...`);

    const location = path.join(APP_PATH, "db", "db.sqlite");
    const db = new Database(location);

    db.pragma("foreign_keys = OFF");
    db.transaction(() => {
        db.exec(`ALTER TABLE 'exitNodes' ADD 'tags' text;`);
    })();
    db.pragma("foreign_keys = ON");

    console.log(`${version} migration complete`);
}
