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
import { findAnalysisById } from "@/lib/db/queries/analyses";
import { findProfileById } from "@/lib/db/queries/profiles";
import { insertSuggestions } from "@/lib/db/queries/suggestions";
import { spendCredits } from "@/lib/services/credits";

export async function POST(request: NextRequest) {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const body = await request.json();
    if (!body.analysisId) return badRequest("analysisId is required");

    const analysis = await findAnalysisById(body.analysisId);
    if (!analysis) return notFound("Analysis not found");

    const profile = await findProfileById(analysis.profileId);
    if (!profile) return notFound("Profile not found");
    if (profile.userId !== authed.userId) return forbidden();

    const credits = await spendCredits(authed.userId, "suggestion_generated", {
      analysisId: body.analysisId,
    });
    if (!credits.success) return forbidden(credits.error);

    const placeholderSuggestions = [
      {
        analysisId: body.analysisId,
        title: "Add a compelling headline",
        description:
          "Your headline should clearly communicate your value proposition in under 10 words.",
        recommendedFix:
          "Rewrite your headline to include your primary skill and key benefit.",
        priority: "high" as const,
      },
      {
        analysisId: body.analysisId,
        title: "Improve portfolio section",
        description:
          "Adding more portfolio items increases trust and conversion rates.",
        recommendedFix:
          "Add at least 3 more relevant portfolio items with descriptions.",
        priority: "medium" as const,
      },
      {
        analysisId: body.analysisId,
        title: "Optimize description keywords",
        description:
          "Your description is missing key search terms that clients use.",
        recommendedFix:
          "Include terms like your specific skills, tools, and industry keywords.",
        priority: "critical" as const,
      },
    ];

    const suggestions = await insertSuggestions(placeholderSuggestions);
    return created(suggestions);
  } catch (error) {
    console.error("[POST /api/suggestions/generate]", error);
    return serverError();
  }
}
