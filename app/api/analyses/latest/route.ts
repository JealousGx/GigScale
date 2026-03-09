import {
  authenticateRequest,
  notFound,
  ok,
  serverError,
  unauthorized,
} from "@/lib/api";
import {
  findLatestAnalysisByUserId,
  findPreviousAnalysisByProfileId,
} from "@/lib/db/queries/analyses";

export async function GET() {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const analysis = await findLatestAnalysisByUserId(authed.userId);
    if (!analysis) return notFound("No analyses found");

    const previousAnalysis = await findPreviousAnalysisByProfileId(
      analysis.profileId,
      analysis.id,
    );

    return ok({ analysis, previousAnalysis });
  } catch (error) {
    console.error("[GET /api/analyses/latest]", error);
    return serverError();
  }
}
