import { sql } from "drizzle-orm";
import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

import { subscriptionId } from "@/lib/id";

import { users } from "./auth";

export const subscriptions = mysqlTable(
  "subscriptions",
  {
    id: varchar("id", { length: 48 }).primaryKey().$defaultFn(subscriptionId),
    userId: varchar("user_id", { length: 48 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    plan: mysqlEnum("plan", ["free", "pro", "enterprise", "custom"])
      .notNull()
      .default("free"),
    status: mysqlEnum("status", [
      "active",
      "inactive",
      "cancelled",
      "past_due",
    ]).notNull(),
    creditsTotal: int("credits_total").notNull().default(2),
    creditsUsed: int("credits_used").notNull().default(0),
    polarSubscriptionId: varchar("polar_subscription_id", { length: 255 }),
    currentPeriodStart: timestamp("current_period_start", { fsp: 3 }),
    currentPeriodEnd: timestamp("current_period_end", { fsp: 3 }),
    createdAt: timestamp("created_at", { fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .onUpdateNow()
      .notNull(),
  },
  (t) => [
    index("subscriptions_user_id_idx").on(t.userId),
    uniqueIndex("subscriptions_polar_id_idx").on(t.polarSubscriptionId),
  ],
);
