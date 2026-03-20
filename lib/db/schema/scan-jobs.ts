import { sql } from "drizzle-orm";
import {
  index,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { scanJobId } from "@/lib/id";
import { analyses } from "./analytics";
import { users } from "./auth";
import { profiles } from "./profile";

export const scanJobs = mysqlTable(
  "scan_jobs",
  {
    id: varchar("id", { length: 48 }).primaryKey().$defaultFn(scanJobId),

    userId: varchar("user_id", { length: 48 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    profileUrl: varchar("profile_url", { length: 2048 }).notNull(),
    platform: mysqlEnum("platform", ["upwork", "fiverr"]).notNull(),

    status: mysqlEnum("status", [
      "queued",
      "running",
      "completed",
      "error",
    ]).notNull(),

    errorMessage: text("error_message"),

    // Optional for debugging / idempotency.
    scrapedMarkdown: text("scraped_markdown"),

    // Optional metadata for provider selection.
    providerUsed: varchar("provider_used", { length: 100 }),

    // Links created rows back to the scan job.
    profileId: varchar("profile_id", { length: 48 }).references(
      () => profiles.id,
      {
        onDelete: "cascade",
      },
    ),
    analysisId: varchar("analysis_id", { length: 48 }).references(
      () => analyses.id,
      {
        onDelete: "cascade",
      },
    ),

    startedAt: timestamp("started_at", { fsp: 3 }),
    finishedAt: timestamp("finished_at", { fsp: 3 }),

    createdAt: timestamp("created_at", { fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (t) => [
    index("scan_jobs_user_status_updated_idx").on(
      t.userId,
      t.status,
      t.updatedAt,
    ),
  ],
);

export type ScanJobRow = typeof scanJobs.$inferSelect;
