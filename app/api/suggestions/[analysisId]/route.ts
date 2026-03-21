import type { NextRequest } from "next/server";

import {
  authenticateRequest,
  badRequest,
  forbidden,
  notFound,
  ok,
  okCached,
  serverError,
  unauthorized,
} from "@/lib/api";
import { findAnalysisWithProfileByAnalysisId } from "@/lib/db/queries/analyses";
import {
  findSuggestionsPageByAnalysisId,
  type SuggestionsCursor,
} from "@/lib/db/queries/suggestions";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

function encodeCursor(cursor: SuggestionsCursor): string {
  return Buffer.from(
    JSON.stringify({
      createdAt: cursor.createdAt.toISOString(),
      id: cursor.id,
    }),
    "utf8",
  ).toString("base64url");
}

function decodeCursor(raw: string): SuggestionsCursor | null {
  try {
    const decoded = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as { createdAt?: string; id?: string };
    if (!decoded.createdAt || !decoded.id) return null;
    const createdAt = new Date(decoded.createdAt);
    if (Number.isNaN(createdAt.getTime())) return null;
    return { createdAt, id: decoded.id };
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> },
) {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const { analysisId } = await params;
    const row = await findAnalysisWithProfileByAnalysisId(analysisId);
    if (!row) return notFound("Analysis not found");

    const { profile } = row;
    if (profile.userId !== authed.userId) return forbidden();

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
    if (rawCursor && !cursor) {
      return badRequest("Invalid cursor");
    }

    const page = await findSuggestionsPageByAnalysisId(
      analysisId,
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
    console.error("[GET /api/suggestions/:analysisId]", error);
    return serverError();
  }
}
