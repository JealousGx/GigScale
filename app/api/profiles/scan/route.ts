import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  authenticateRequest,
  created,
  forbidden,
  handleRouteError,
  parseBody,
  unauthorized,
} from "@/lib/api";
import { findPreviousAnalysisByUserAndProfileUrl } from "@/lib/db/queries/analyses";
import { analyzeProfile } from "@/lib/services/analyzer";
import { spendCredits } from "@/lib/services/credits";

const scanSchema = z.object({
  profileUrl: z.string().url("profileUrl must be a valid URL"),
  platform: z.enum(["upwork", "fiverr"], {
    message: "platform must be 'upwork' or 'fiverr'",
  }),
});

export async function POST(request: NextRequest) {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const parsed = await parseBody(request, scanSchema);
    if ("error" in parsed) return parsed.error;
    const { profileUrl, platform } = parsed.data;

    const credits = await spendCredits(authed.userId, "profile_scan", {
      profileUrl,
      platform,
    });
    if (!credits.success) return forbidden(credits.error);

    const { profile, analysis } = await analyzeProfile({
      userId: authed.userId,
      profileUrl,
      platform,
    });

    const previousAnalysis = analysis
      ? await findPreviousAnalysisByUserAndProfileUrl(
          authed.userId,
          profileUrl,
          analysis.id,
        )
      : null;

    return created({ profile, analysis, previousAnalysis });
  } catch (error) {
    return handleRouteError(error, "[POST /api/profiles/scan]");
  }
}
