import type { NextRequest } from "next/server";

import {
  authenticateRequest,
  badRequest,
  created,
  forbidden,
  serverError,
  unauthorized,
} from "@/lib/api";
import { insertAnalysis } from "@/lib/db/queries/analyses";
import {
  insertProfile,
  updateProfileLastScanned,
} from "@/lib/db/queries/profiles";
import { spendCredits } from "@/lib/services/credits";

export async function POST(request: NextRequest) {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const body = await request.json();
    if (!body.profileUrl || !body.platform) {
      return badRequest("profileUrl and platform are required");
    }
    if (!["upwork", "fiverr"].includes(body.platform)) {
      return badRequest("platform must be 'upwork' or 'fiverr'");
    }

    const credits = await spendCredits(authed.userId, "profile_scan", {
      profileUrl: body.profileUrl,
      platform: body.platform,
    });
    if (!credits.success) {
      return forbidden(credits.error);
    }

    const profile = await insertProfile({
      userId: authed.userId,
      platform: body.platform,
      profileUrl: body.profileUrl,
      profileTitle: `${body.platform.charAt(0).toUpperCase() + body.platform.slice(1)} Profile`,
      profileDescription: "Profile scanned via GigScale",
    });

    const scores = {
      profileScore: (Math.random() * 30 + 50).toFixed(2),
      visibilityScore: (Math.random() * 30 + 40).toFixed(2),
      conversionScore: (Math.random() * 30 + 45).toFixed(2),
      trustScore: (Math.random() * 20 + 60).toFixed(2),
      completenessScore: (Math.random() * 30 + 40).toFixed(2),
    };

    const analysis = await insertAnalysis({
      profileId: profile.id,
      ...scores,
    });

    await updateProfileLastScanned(profile.id);

    return created({ profile, analysis });
  } catch (error) {
    console.error("[POST /api/profiles/scan]", error);
    return serverError();
  }
}
