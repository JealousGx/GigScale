import "server-only";

import { and, desc, eq, lt, or } from "drizzle-orm";
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

export interface RewritesCursor {
  createdAt: Date;
  id: string;
}

export async function findRewritesPageByProfileId(
  profileId: string,
  pageSize: number,
  cursor?: RewritesCursor,
) {
  const whereCondition = cursor
    ? and(
        eq(rewrites.profileId, profileId),
        or(
          lt(rewrites.createdAt, cursor.createdAt),
          and(
            eq(rewrites.createdAt, cursor.createdAt),
            lt(rewrites.id, cursor.id),
          ),
        ),
      )
    : eq(rewrites.profileId, profileId);

  const rows = await getDb()
    .select()
    .from(rewrites)
    .where(whereCondition)
    .orderBy(desc(rewrites.createdAt), desc(rewrites.id))
    .limit(pageSize + 1);

  const hasMore = rows.length > pageSize;
  const items = hasMore ? rows.slice(0, pageSize) : rows;

  return {
    items,
    hasMore,
    nextCursor: hasMore
      ? ({
          createdAt: items[items.length - 1]!.createdAt,
          id: items[items.length - 1]!.id,
        } as RewritesCursor)
      : null,
  };
}
