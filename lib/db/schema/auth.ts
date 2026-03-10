import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 48 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 48 }).primaryKey(),
    expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at", { fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: varchar("user_id", { length: 48 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const accounts = mysqlTable(
  "accounts",
  {
    id: varchar("id", { length: 48 }).primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: varchar("user_id", { length: 48 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3 }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3 }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .$onUpdate(() => new Date())
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
  },
  (t) => [index("accounts_user_id_idx").on(t.userId)],
);

export const verifications = mysqlTable(
  "verifications",
  {
    id: varchar("id", { length: 48 }).primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
    createdAt: timestamp("created_at", { fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .default(sql`CURRENT_TIMESTAMP(3)`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)],
);
