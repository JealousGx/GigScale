import { relations } from "drizzle-orm";

export { analyses } from "./analytics";
export { accounts, sessions, users, verifications } from "./auth";
export { type ProfileCrawlMeta, profiles } from "./profile";
export { providerDailyQuota } from "./provider-daily-quota";
export { rewrites } from "./rewrite";
export { subscriptions } from "./subscription";
export { suggestions } from "./suggestion";
export { usageLogs } from "./usage-logs";

import { analyses } from "./analytics";
import { accounts, sessions, users } from "./auth";
import { profiles } from "./profile";
import { rewrites } from "./rewrite";
import { subscriptions } from "./subscription";
import { suggestions } from "./suggestion";
import { usageLogs } from "./usage-logs";

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  profiles: many(profiles),
  subscriptions: many(subscriptions),
  usageLogs: many(usageLogs),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  users: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  users: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  users: one(users, { fields: [profiles.userId], references: [users.id] }),
  analyses: many(analyses),
  rewrites: many(rewrites),
}));

export const analysesRelations = relations(analyses, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [analyses.profileId],
    references: [profiles.id],
  }),
  suggestions: many(suggestions),
}));

export const suggestionsRelations = relations(suggestions, ({ one }) => ({
  analysis: one(analyses, {
    fields: [suggestions.analysisId],
    references: [analyses.id],
  }),
}));

export const rewritesRelations = relations(rewrites, ({ one }) => ({
  profile: one(profiles, {
    fields: [rewrites.profileId],
    references: [profiles.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const usageLogsRelations = relations(usageLogs, ({ one }) => ({
  user: one(users, { fields: [usageLogs.userId], references: [users.id] }),
}));
