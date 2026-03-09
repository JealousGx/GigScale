import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb } from "..";
import { rewrites } from "../schema";

export async function insertRewrite(data: {
  profileId: string;
  type: "headline" | "description" | "gig";
  mode:
    | "seo_optimization"
    | "conversion_optimization"
    | "premium_client_targeting"
    | "clarity_improvement";
  originalText: string;
  rewrittenText: string;
}) {
  const [row] = await getDb().insert(rewrites).values(data).$returningId();
  return findRewriteById(row.id);
}

export async function findRewriteById(id: string) {
  const rows = await getDb()
    .select()
    .from(rewrites)
    .where(eq(rewrites.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function findRewritesByProfileId(profileId: string) {
  return getDb()
    .select()
    .from(rewrites)
    .where(eq(rewrites.profileId, profileId))
    .orderBy(desc(rewrites.createdAt));
}
