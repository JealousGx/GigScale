import { sql } from "drizzle-orm";
import {
  index,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { rewriteId } from "@/lib/id";

import { profiles } from "./profile";

export const rewrites = mysqlTable(
  "rewrites",
  {
    id: varchar("id", { length: 48 }).primaryKey().$defaultFn(rewriteId),
    profileId: varchar("profile_id", { length: 48 })
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    type: mysqlEnum("type", ["headline", "description", "gig"]).notNull(),
    mode: mysqlEnum("mode", [
      "seo_optimization",
      "conversion_optimization",
      "premium_client_targeting",
      "clarity_improvement",
    ]).notNull(),
    originalText: text("original_text").notNull(),
    rewrittenText: text("rewritten_text").notNull(),
    createdAt: timestamp("created_at", { fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (t) => [
    index("rewrites_profile_id_idx").on(t.profileId),
    index("rewrites_profile_created_idx").on(t.profileId, t.createdAt),
  ],
);
