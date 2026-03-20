import type { NextRequest } from "next/server";

import {
  authenticateRequest,
  badRequest,
  ok,
  okCached,
  serverError,
  unauthorized,
} from "@/lib/api";
import {
  findProfilesPageByUserId,
  type ProfilesCursor,
} from "@/lib/db/queries/profiles";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

function encodeCursor(cursor: ProfilesCursor): string {
  return Buffer.from(
    JSON.stringify({
      updatedAt: cursor.updatedAt.toISOString(),
      id: cursor.id,
    }),
    "utf8",
  ).toString("base64url");
}

function decodeCursor(raw: string): ProfilesCursor | null {
  try {
    const decoded = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as { updatedAt?: string; id?: string };
    if (!decoded.updatedAt || !decoded.id) return null;
    const updatedAt = new Date(decoded.updatedAt);
    if (Number.isNaN(updatedAt.getTime())) return null;
    return { updatedAt, id: decoded.id };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const pageSizeParam = request.nextUrl.searchParams.get("pageSize");
    const rawCursor = request.nextUrl.searchParams.get("cursor");
    const parsedPageSize = pageSizeParam
      ? Number.parseInt(pageSizeParam, 10)
      : NaN;

    const pageSize =
      Number.isFinite(parsedPageSize) && parsedPageSize > 0
        ? Math.min(parsedPageSize, MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE;

    const cursor = rawCursor ? decodeCursor(rawCursor) : null;
    if (rawCursor && !cursor) return badRequest("Invalid cursor");

    const page = await findProfilesPageByUserId(
      authed.userId,
      pageSize,
      cursor ?? undefined,
    );

    if (!page || page.items.length === 0) {
      return ok({
        items: [],
        hasMore: false,
        nextCursor: null,
        pageSize,
      });
    }

    return okCached({
      items: page.items,
      hasMore: page.hasMore,
      nextCursor: page.nextCursor ? encodeCursor(page.nextCursor) : null,
      pageSize,
    });
  } catch (error) {
    console.error("[GET /api/profiles]", error);
    return serverError();
  }
}
