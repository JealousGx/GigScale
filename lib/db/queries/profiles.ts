import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "..";
import { profiles } from "../schema";

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
}) {
  const [row] = await getDb().insert(profiles).values(data).$returningId();
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

export async function updateProfileLastScanned(id: string) {
  await getDb()
    .update(profiles)
    .set({ lastScannedAt: new Date() })
    .where(eq(profiles.id, id));
}
