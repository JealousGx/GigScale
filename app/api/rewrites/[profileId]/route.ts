import type { NextRequest } from "next/server";

import {
  authenticateRequest,
  forbidden,
  notFound,
  okCached,
  serverError,
  unauthorized,
} from "@/lib/api";
import { findProfileById } from "@/lib/db/queries/profiles";
import { findRewritesByProfileId } from "@/lib/db/queries/rewrites";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> },
) {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const { profileId } = await params;
    const profile = await findProfileById(profileId);
    if (!profile) return notFound("Profile not found");
    if (profile.userId !== authed.userId) return forbidden();

    const rewrites = await findRewritesByProfileId(profileId);
    return okCached(rewrites);
  } catch (error) {
    console.error("[GET /api/rewrites/:profileId]", error);
    return serverError();
  }
}
