import "server-only";

import { and, desc, eq, lt, or } from "drizzle-orm";
import { getDb } from "..";
import { type ProfileCrawlMeta, profiles } from "../schema";

export async function insertProfile(data: {
  userId: string;
  platform: "upwork" | "fiverr";
  profileUrl: string;
  profileTitle: string;
  profileDescription: string;
  reviewRating?: string;
  reviewCount?: number;
  portfolioCount?: number;
  profileAgeYears?: string;
  crawlMeta?: ProfileCrawlMeta;
}) {
  const [row] = await getDb()
    .insert(profiles)
    .values({ ...data, lastScannedAt: new Date() })
    .$returningId();
  return findProfileById(row.id);
}

export async function findProfileById(id: string) {
  const rows = await getDb()
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function findProfilesByUserId(userId: string) {
  return getDb()
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .orderBy(desc(profiles.updatedAt));
}

export interface ProfilesCursor {
  updatedAt: Date;
  id: string;
}

export async function findProfilesPageByUserId(
  userId: string,
  pageSize: number,
  cursor?: ProfilesCursor,
) {
  const whereCondition = cursor
    ? and(
        eq(profiles.userId, userId),
        or(
          lt(profiles.updatedAt, cursor.updatedAt),
          and(
            eq(profiles.updatedAt, cursor.updatedAt),
            lt(profiles.id, cursor.id),
          ),
        ),
      )
    : eq(profiles.userId, userId);

  const rows = await getDb()
    .select()
    .from(profiles)
    .where(whereCondition)
    .orderBy(desc(profiles.updatedAt), desc(profiles.id))
    .limit(pageSize + 1);

  const hasMore = rows.length > pageSize;
  const items = hasMore ? rows.slice(0, pageSize) : rows;

  return {
    items,
    hasMore,
    nextCursor: hasMore
      ? ({
          updatedAt: items[items.length - 1]!.updatedAt,
          id: items[items.length - 1]!.id,
        } as ProfilesCursor)
      : null,
  };
}

export async function updateProfileLastScanned(id: string) {
  await getDb()
    .update(profiles)
    .set({ lastScannedAt: new Date() })
    .where(eq(profiles.id, id));
}
