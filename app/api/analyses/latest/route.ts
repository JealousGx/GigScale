import {
  authenticateRequest,
  notFound,
  ok,
  serverError,
  unauthorized,
} from "@/lib/api";
import {
  findLatestAnalysisByUserId,
  findPreviousAnalysisByUserAndProfileUrl,
} from "@/lib/db/queries/analyses";
import { findProfileById } from "@/lib/db/queries/profiles";

export async function GET() {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const analysis = await findLatestAnalysisByUserId(authed.userId);
    if (!analysis) return notFound("No analyses found");

    const profile = await findProfileById(analysis.profileId);
    const previousAnalysis = profile
      ? await findPreviousAnalysisByUserAndProfileUrl(
          profile.userId,
          profile.profileUrl,
          analysis.id,
        )
      : null;

    return ok({ analysis, previousAnalysis });
  } catch (error) {
    console.error("[GET /api/analyses/latest]", error);
    return serverError();
  }
}
