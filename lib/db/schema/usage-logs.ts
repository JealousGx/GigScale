import {
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { usageLogId } from "@/lib/id";

import { users } from "./auth";

export const usageLogs = mysqlTable(
  "usage_logs",
  {
    id: varchar("id", { length: 48 }).primaryKey().$defaultFn(usageLogId),
    userId: varchar("user_id", { length: 48 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: mysqlEnum("action", [
      "profile_scan",
      "suggestion_generated",
      "rewrite_generated",
      "report_exported",
    ]).notNull(),
    creditsConsumed: int("credits_consumed").notNull().default(1),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (t) => [
    index("usage_logs_user_id_idx").on(t.userId),
    index("usage_logs_user_action_ts_idx").on(
      t.userId,
      t.action,
      t.timestamp,
    ),
  ],
);
