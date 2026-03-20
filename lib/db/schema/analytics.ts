import { sql } from "drizzle-orm";
import {
  decimal,
  index,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { analysisId } from "@/lib/id";
import { profiles } from "./profile";

export const analyses = mysqlTable(
  "analyses",
  {
    id: varchar("id", { length: 48 }).primaryKey().$defaultFn(analysisId),
    profileId: varchar("profile_id", { length: 48 })
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    profileScore: decimal("profile_score", { precision: 5, scale: 2 })
      .default("0")
      .notNull(),
    visibilityScore: decimal("visibility_score", { precision: 5, scale: 2 })
      .default("0")
      .notNull(),
    conversionScore: decimal("conversion_score", { precision: 5, scale: 2 })
      .default("0")
      .notNull(),
    trustScore: decimal("trust_score", { precision: 5, scale: 2 })
      .default("0")
      .notNull(),
    completenessScore: decimal("completeness_score", { precision: 5, scale: 2 })
      .default("0")
      .notNull(),
    summary: text("summary"),
    analysisEvidenceContext: text("analysis_evidence_context"),
    analysisEvidenceType: varchar("analysis_evidence_type", { length: 20 }),
    createdAt: timestamp("created_at", { fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (t) => [
    index("analyses_profile_id_idx").on(t.profileId),
    index("analyses_profile_created_idx").on(t.profileId, t.createdAt),
  ],
);
