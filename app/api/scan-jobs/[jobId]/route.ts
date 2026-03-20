import type { NextRequest } from "next/server";
import { z } from "zod";

import { authenticateRequest, notFound, ok, unauthorized } from "@/lib/api";
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
      return ok({
        status: job.status,
        errorMessage: job.errorMessage,
      });
    }

    const profile = job.profileId ? await findProfileById(job.profileId) : null;
    const analysis = job.analysisId
      ? await findAnalysisById(job.analysisId)
      : null;

    return ok({
      status: "completed",
      profile,
      analysis,
    });
  } catch {
    // Avoid leaking internal errors to the client polling loop.
    return ok({ status: "error", errorMessage: "Failed to load scan job" });
  }
}
