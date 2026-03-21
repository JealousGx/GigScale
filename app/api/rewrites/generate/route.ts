import type { NextRequest } from "next/server";
import { z } from "zod";

import type { ProfileAnalysisResult } from "@/lib/ai/prompts/analyze-profile";
import {
  authenticateRequest,
  created,
  forbidden,
  handleRouteError,
  notFound,
  parseBody,
  unauthorized,
} from "@/lib/api";
import { findLatestAnalysisByProfileId } from "@/lib/db/queries/analyses";
import { findProfileById } from "@/lib/db/queries/profiles";
import { spendCredits } from "@/lib/services/credits";
import { generateRewrite } from "@/lib/services/rewrite-engine";

const rewriteSchema = z.object({
  profileId: z.string().min(1, "profileId is required"),
  type: z.enum(["headline", "description", "gig"], {
    message: "type must be 'headline', 'description', or 'gig'",
  }),
  originalText: z.string().min(1, "originalText is required"),
  mode: z.enum(
    [
      "seo_optimization",
      "conversion_optimization",
      "premium_client_targeting",
      "clarity_improvement",
    ],
    { message: "Invalid rewrite mode" },
  ),
});

export async function POST(request: NextRequest) {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const parsed = await parseBody(request, rewriteSchema);
    if ("error" in parsed) return parsed.error;
    const { profileId, type, originalText, mode } = parsed.data;

    const profile = await findProfileById(profileId);
    if (!profile) return notFound("Profile not found");
    if (profile.userId !== authed.userId) return forbidden();

    const [credits, latestAnalysis] = await Promise.all([
      spendCredits(authed.userId, "rewrite_generated", {
        profileId,
        type,
        mode,
      }),
      findLatestAnalysisByProfileId(profileId),
    ]);
    if (!credits.success) return forbidden(credits.error);

    let analysisScores: ProfileAnalysisResult | null = null;
    if (latestAnalysis) {
      analysisScores = {
        profileScore: parseFloat(latestAnalysis.profileScore),
        visibilityScore: parseFloat(latestAnalysis.visibilityScore),
        conversionScore: parseFloat(latestAnalysis.conversionScore),
        trustScore: parseFloat(latestAnalysis.trustScore),
        completenessScore: parseFloat(latestAnalysis.completenessScore),
        summary: latestAnalysis.summary ?? "",
      };
    }

    const rewrite = await generateRewrite({
      profileId,
      type,
      mode,
      originalText,
      platform: profile.platform,
      analysisScores,
    });

    return created(rewrite);
  } catch (error) {
    return handleRouteError(error, "[POST /api/rewrites/generate]");
  }
}
