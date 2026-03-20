import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  authenticateRequest,
  created,
  forbidden,
  handleRouteError,
  notFound,
  parseBody,
  unauthorized,
} from "@/lib/api";
import type { ProfileAnalysisResult } from "@/lib/ai/prompts/analyze-profile";
import type { SuggestionsProfileData } from "@/lib/ai/prompts/generate-suggestions";
import { findAnalysisById } from "@/lib/db/queries/analyses";
import { findProfileById } from "@/lib/db/queries/profiles";
import { spendCredits } from "@/lib/services/credits";
import { generateSuggestions } from "@/lib/services/suggestion-engine";

const suggestionsSchema = z.object({
  analysisId: z.string().min(1, "analysisId is required"),
});

export async function POST(request: NextRequest) {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const parsed = await parseBody(request, suggestionsSchema);
    if ("error" in parsed) return parsed.error;
    const { analysisId } = parsed.data;

    const analysis = await findAnalysisById(analysisId);
    if (!analysis) return notFound("Analysis not found");

    const profile = await findProfileById(analysis.profileId);
    if (!profile) return notFound("Profile not found");
    if (profile.userId !== authed.userId) return forbidden();

    const credits = await spendCredits(authed.userId, "suggestion_generated", {
      analysisId,
    });
    if (!credits.success) return forbidden(credits.error);

    const meta = profile.crawlMeta as {
      skills?: string[];
      hourlyRate?: string | null;
      completedJobs?: number | null;
      location?: string | null;
    } | null;

    const profileData: SuggestionsProfileData = {
      title: profile.profileTitle,
      description: profile.profileDescription,
      platform: profile.platform,
      skills: meta?.skills ?? [],
      reviewRating: parseFloat(profile.reviewRating),
      reviewCount: profile.reviewCount,
      portfolioCount: profile.portfolioCount,
      hourlyRate: meta?.hourlyRate ?? null,
      completedJobs: meta?.completedJobs ?? null,
      location: meta?.location ?? null,
    };

    const analysisScores: ProfileAnalysisResult = {
      profileScore: parseFloat(analysis.profileScore),
      visibilityScore: parseFloat(analysis.visibilityScore),
      conversionScore: parseFloat(analysis.conversionScore),
      trustScore: parseFloat(analysis.trustScore),
      completenessScore: parseFloat(analysis.completenessScore),
      summary: analysis.summary ?? "",
    };

    const suggestions = await generateSuggestions({
      analysisId,
      profile: profileData,
      analysisScores,
      analysisEvidenceContext: analysis.analysisEvidenceContext ?? null,
      analysisEvidenceType: analysis.analysisEvidenceType ?? null,
    });

    return created(suggestions);
  } catch (error) {
    return handleRouteError(error, "[POST /api/suggestions/generate]");
  }
}
