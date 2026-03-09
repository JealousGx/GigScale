import {
  authenticateRequest,
  notFound,
  ok,
  serverError,
  unauthorized,
} from "@/lib/api";
import { findLatestAnalysisByUserId } from "@/lib/db/queries/analyses";

export async function GET() {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const analysis = await findLatestAnalysisByUserId(authed.userId);
    if (!analysis) return notFound("No analyses found");

    return ok(analysis);
  } catch (error) {
    console.error("[GET /api/analyses/latest]", error);
    return serverError();
  }
}
