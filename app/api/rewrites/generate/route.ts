import type { NextRequest } from "next/server";

import {
  authenticateRequest,
  badRequest,
  created,
  forbidden,
  notFound,
  serverError,
  unauthorized,
} from "@/lib/api";
import { findProfileById } from "@/lib/db/queries/profiles";
import { insertRewrite } from "@/lib/db/queries/rewrites";
import { spendCredits } from "@/lib/services/credits";

const VALID_TYPES = ["headline", "description", "gig"] as const;
const VALID_MODES = [
  "seo_optimization",
  "conversion_optimization",
  "premium_client_targeting",
  "clarity_improvement",
] as const;

export async function POST(request: NextRequest) {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const body = await request.json();
    const { profileId, type, originalText, mode } = body;

    if (!profileId || !type || !originalText || !mode) {
      return badRequest("profileId, type, originalText, and mode are required");
    }
    if (!VALID_TYPES.includes(type)) return badRequest("Invalid rewrite type");
    if (!VALID_MODES.includes(mode)) return badRequest("Invalid rewrite mode");

    const profile = await findProfileById(profileId);
    if (!profile) return notFound("Profile not found");
    if (profile.userId !== authed.userId) return forbidden();

    const credits = await spendCredits(authed.userId, "rewrite_generated", {
      profileId,
      type,
      mode,
    });
    if (!credits.success) return forbidden(credits.error);

    // Placeholder until AI is integrated
    const rewrittenText = `[${mode.replace(/_/g, " ").toUpperCase()}] ${originalText}`;

    const rewrite = await insertRewrite({
      profileId,
      type,
      mode,
      originalText,
      rewrittenText,
    });

    return created(rewrite);
  } catch (error) {
    console.error("[POST /api/rewrites/generate]", error);
    return serverError();
  }
}
