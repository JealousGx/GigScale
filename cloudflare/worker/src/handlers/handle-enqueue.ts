import type { Env, EnqueueMessage } from "../worker-types";

export async function handleEnqueueRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  const bodyUnknown = (await request.json()) as unknown;
  const body = bodyUnknown as Partial<EnqueueMessage>;

  if (
    typeof body.jobId !== "string" ||
    typeof body.profileUrl !== "string" ||
    (body.platform !== "upwork" && body.platform !== "fiverr") ||
    typeof body.webhookUrl !== "string" ||
    typeof body.cloudflareAllowed !== "boolean"
  ) {
    return Response.json({ error: "Invalid enqueue payload" }, { status: 400 });
  }

  await env.gigscale_scan_jobs.send({
    jobId: body.jobId,
    profileUrl: body.profileUrl,
    platform: body.platform,
    cloudflareAllowed: body.cloudflareAllowed,
    webhookUrl: body.webhookUrl,
  });

  return Response.json({ status: "enqueued" }, { status: 202 });
}

