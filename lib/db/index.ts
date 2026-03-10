import "server-only";

import { connect, type Connection } from "@tidbcloud/serverless";
import {
  drizzle,
  type TiDBServerlessDatabase,
} from "drizzle-orm/tidb-serverless";

import { env } from "@/lib/env";

export * from "./schema";

export type DB = TiDBServerlessDatabase<Record<string, never>> & {
  $client: Connection;
};

let _db: DB | undefined;

export function getDb(): DB {
  if (!_db) {
    const client = connect({
      url: env.DATABASE_URL,
    });
    _db = drizzle(client);
  }
  return _db;
}
