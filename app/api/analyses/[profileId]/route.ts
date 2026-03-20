import type { NextRequest } from "next/server";

import {
  authenticateRequest,
  forbidden,
  notFound,
  ok,
  okCached,
  serverError,
  unauthorized,
} from "@/lib/api";
import {
  findLatestAnalysisByProfileId,
  findPreviousAnalysisByUserAndProfileUrl,
} from "@/lib/db/queries/analyses";
import { findProfileById } from "@/lib/db/queries/profiles";

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

    const analysis = await findLatestAnalysisByProfileId(profileId);
    if (!analysis) return notFound("No analysis found");

    const previousAnalysis = await findPreviousAnalysisByUserAndProfileUrl(
      profile.userId,
      profile.profileUrl,
      analysis.id,
    );

    if (!previousAnalysis || !analysis || !profile) {
      return ok({ profile, analysis, previousAnalysis });
    }

    return okCached({ profile, analysis, previousAnalysis });
  } catch (error) {
    console.error("[GET /api/analyses/:profileId]", error);
    return serverError();
  }
}
