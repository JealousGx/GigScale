import "server-only";

import { type Connection, connect } from "@tidbcloud/serverless";
import {
  drizzle,
  type TiDBServerlessDatabase,
} from "drizzle-orm/tidb-serverless";

import { env } from "@/lib/env";
import { getLocal, type LocalDb } from "./local";

export * from "./schema";

type DB = TiDBServerlessDatabase<Record<string, never>> & {
  $client: Connection;
};

let _db: DB | undefined;

function getTiDB(): DB {
  if (!_db) {
    const client = connect({
      url: env.DATABASE_URL,
    });
    _db = drizzle(client);
  }
  return _db;
}

export function getDb(): LocalDb {
  if (process.env.ENVIRONMENT === "local") {
    return getLocal();
  }
  // TiDB serverless is API-compatible with mysql2 for our queries; cast so TS sees one type
  return getTiDB() as unknown as LocalDb;
}

export { getMutationAffectedRows } from "./mutation-result";
