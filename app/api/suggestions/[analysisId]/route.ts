import type { NextRequest } from "next/server";

import {
  authenticateRequest,
  forbidden,
  notFound,
  ok,
  serverError,
  unauthorized,
} from "@/lib/api";
import { findAnalysisById } from "@/lib/db/queries/analyses";
import { findProfileById } from "@/lib/db/queries/profiles";
import { findSuggestionsByAnalysisId } from "@/lib/db/queries/suggestions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> },
) {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const { analysisId } = await params;
    const analysis = await findAnalysisById(analysisId);
    if (!analysis) return notFound("Analysis not found");

    const profile = await findProfileById(analysis.profileId);
    if (!profile) return notFound("Profile not found");
    if (profile.userId !== authed.userId) return forbidden();

    const suggestions = await findSuggestionsByAnalysisId(analysisId);
    return ok(suggestions);
  } catch (error) {
    console.error("[GET /api/suggestions/:analysisId]", error);
    return serverError();
  }
}
