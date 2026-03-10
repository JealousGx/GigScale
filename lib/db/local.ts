import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { env } from "@/lib/env";

import * as schema from "./schema";

export type DB = MySql2Database<typeof schema>;

let _db: DB | undefined;

export function getLocal(): DB {
  if (!_db) {
    const pool = mysql.createPool(env.DATABASE_URL);
    _db = drizzle(pool, { schema, mode: "default" });
  }
  return _db;
}
