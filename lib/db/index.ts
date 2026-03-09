export * from "./schema";

import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as schema from "./schema";

export type DB = MySql2Database<typeof schema>;

let _db: DB | undefined;

export function getDb(): DB {
  if (!_db) {
    const pool = mysql.createPool(process.env.DATABASE_URL as string);
    _db = drizzle(pool, { schema, mode: "default" });
  }
  return _db;
}
