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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const { id } = await params;
    const profile = await findProfileById(id);
    if (!profile) return notFound("Profile not found");
    if (profile.userId !== authed.userId) return forbidden();

    return okCached(profile);
  } catch (error) {
    console.error("[GET /api/profiles/:id]", error);
    return serverError();
  }
}
