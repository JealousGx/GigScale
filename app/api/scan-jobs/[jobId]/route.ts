import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  authenticateRequest,
  notFound,
  okCached,
  okPrivateNoStore,
  unauthorized,
} from "@/lib/api";
import { findAnalysisById } from "@/lib/db/queries/analyses";
import { findProfileById } from "@/lib/db/queries/profiles";
import { findScanJobByIdForUser } from "@/lib/db/queries/scan-jobs";

const jobIdParamSchema = z.object({
  jobId: z.string().min(1),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const authed = await authenticateRequest();
    if (!authed) return unauthorized();

    const parsed = jobIdParamSchema.safeParse(await params);
    if (!parsed.success) return notFound();

    const job = await findScanJobByIdForUser({
      userId: authed.userId,
      jobId: parsed.data.jobId,
    });

    if (!job) return notFound();

    if (job.status !== "completed") {
      return okPrivateNoStore({
        status: job.status,
        errorMessage: job.errorMessage,
      });
    }

    const [profile, analysis] = await Promise.all([
      job.profileId ? findProfileById(job.profileId) : Promise.resolve(null),
      job.analysisId ? findAnalysisById(job.analysisId) : Promise.resolve(null),
    ]);

    return okCached({
      status: "completed",
      profile,
      analysis,
    });
  } catch {
    // Avoid leaking internal errors to the client polling loop.
    return okPrivateNoStore({
      status: "error",
      errorMessage: "Failed to load scan job",
    });
  }
}
