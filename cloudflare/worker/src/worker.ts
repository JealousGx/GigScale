import { handleEnqueueRequest } from "./handlers/handle-enqueue";
import { handleQueueBatch } from "./handlers/handle-queue-batch";
import type { Env, QueueBatch } from "./worker-types";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/enqueue" && request.method === "POST") {
      return handleEnqueueRequest(request, env);
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },

  async queue(batch: QueueBatch, env: Env): Promise<void> {
    await handleQueueBatch(batch, env);
  },
};
