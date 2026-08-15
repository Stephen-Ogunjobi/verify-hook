import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const databasePath = process.env.DATABASE_PATH || "./data/webhooks.db";

const databaseDirectory = path.dirname(databasePath);

fs.mkdirSync(databaseDirectory, { recursive: true });

export const database = new Database(databasePath);

//WAL mode for better read/write
database.pragma("journal_mode = WAL");
database.pragma("foreign_keys = ON");
