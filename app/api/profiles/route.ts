import { authenticateRequest, ok, serverError, unauthorized } from "@/lib/api";
import { findProfilesByUserId } from "@/lib/db/queries/profiles";

export async function GET() {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const profiles = await findProfilesByUserId(authed.userId);
    return ok(profiles);
  } catch (error) {
    console.error("[GET /api/profiles]", error);
    return serverError();
  }
}
