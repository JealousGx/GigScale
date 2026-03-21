import {
  authenticateRequest,
  notFound,
  ok,
  serverError,
  unauthorized,
} from "@/lib/api";
import {
  findLatestAnalysisWithProfileByUserId,
  findPreviousAnalysisByUserAndProfileUrl,
} from "@/lib/db/queries/analyses";

export async function GET() {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const row = await findLatestAnalysisWithProfileByUserId(authed.userId);
    if (!row) return notFound("No analyses found");

    const { analysis, profile } = row;
    const previousAnalysis = await findPreviousAnalysisByUserAndProfileUrl(
      profile.userId,
      profile.profileUrl,
      analysis.id,
    );

    return ok({ analysis, previousAnalysis });
  } catch (error) {
    console.error("[GET /api/analyses/latest]", error);
    return serverError();
  }
}
