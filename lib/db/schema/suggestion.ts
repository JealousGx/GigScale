import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { suggestionId } from "@/lib/id";

import { analyses } from "./analytics";

export const suggestions = mysqlTable(
  "suggestions",
  {
    id: varchar("id", { length: 48 }).primaryKey().$defaultFn(suggestionId),
    analysisId: varchar("analysis_id", { length: 48 })
      .notNull()
      .references(() => analyses.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description").notNull(),
    recommendedFix: text("recommended_fix").notNull(),
    priority: mysqlEnum("priority", [
      "critical",
      "high",
      "medium",
      "low",
    ]).notNull(),
    isApplied: boolean("is_applied").default(false).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (t) => [
    index("suggestions_analysis_id_idx").on(t.analysisId),
    index("suggestions_priority_idx").on(t.priority),
  ],
);
