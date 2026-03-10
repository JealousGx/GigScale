import "server-only";

export * from "./schema";

import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { env } from "@/lib/env";

import * as schema from "./schema";

export type DB = MySql2Database<typeof schema>;

let _db: DB | undefined;

export function getDb(): DB {
  if (!_db) {
    const pool = mysql.createPool({
      uri: env.DATABASE_URL,
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      },
      connectionLimit: 5,
    });
    _db = drizzle(pool, { schema, mode: "default" });
  }
  return _db;
}
