import {
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

import { profileId } from "@/lib/id";

import { users } from "./auth";

export interface ProfileCrawlMeta {
  skills: string[];
  hourlyRate: string | null;
  completedJobs: number | null;
  memberSince: string | null;
  location: string | null;
}

export const profiles = mysqlTable(
  "profiles",
  {
    id: varchar("id", { length: 48 }).primaryKey().$defaultFn(profileId),
    userId: varchar("user_id", { length: 48 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    platform: mysqlEnum("platform", ["upwork", "fiverr"]).notNull(),
    profileUrl: varchar("profile_url", { length: 2048 }).notNull(),
    profileTitle: varchar("profile_title", { length: 500 }).notNull(),
    profileDescription: text("profile_description").notNull(),
    reviewRating: decimal("review_rating", { precision: 3, scale: 2 })
      .default("0")
      .notNull(),
    reviewCount: int("review_count").default(0).notNull(),
    portfolioCount: int("portfolio_count").default(0).notNull(),
    profileAgeYears: decimal("profile_age_years", { precision: 4, scale: 1 })
      .default("0")
      .notNull(),
    crawlMeta: json("crawl_meta").$type<ProfileCrawlMeta>(),
    lastScannedAt: timestamp("last_scanned_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("profiles_user_id_idx").on(t.userId),
    index("profiles_user_platform_idx").on(t.userId, t.platform),
  ],
);
