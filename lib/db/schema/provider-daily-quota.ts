import { sql } from "drizzle-orm";
import {
  index,
  int,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import { providerDailyQuotaId } from "@/lib/id";

export const providerDailyQuota = mysqlTable(
  "provider_daily_quota",
  {
    id: varchar("id", { length: 48 })
      .primaryKey()
      .$defaultFn(providerDailyQuotaId),
    provider: varchar("provider", { length: 100 }).notNull(),
    /**
     * UTC day key in `YYYY-MM-DD` format so quota resets are consistent.
     * (Using varchar keeps it compatible with MySQL/TiDB migrations.)
     */
    day: varchar("day", { length: 10 }).notNull(),
    providerUsed: int("provider_used").notNull().default(0),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (t) => [
    index("provider_daily_quota_provider_idx").on(t.provider),
    index("provider_daily_quota_day_idx").on(t.day),
    uniqueIndex("provider_daily_quota_provider_day_unique").on(
      t.provider,
      t.day,
    ),
  ],
);

export type ProviderDailyQuotaRow = typeof providerDailyQuota.$inferSelect;
