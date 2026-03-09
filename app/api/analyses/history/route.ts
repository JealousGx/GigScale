import { authenticateRequest, ok, serverError, unauthorized } from "@/lib/api";
import { findAnalysisHistoryByUserId } from "@/lib/db/queries/analyses";

export async function GET() {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const history = await findAnalysisHistoryByUserId(authed.userId);
    return ok(history);
  } catch (error) {
    console.error("[GET /api/analyses/history]", error);
    return serverError();
  }
}
