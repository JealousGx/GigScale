import type { Env, QueueBatch } from "../worker-types";
import { handleScanJob } from "../consumer/handle-scan-job";

export async function handleQueueBatch(
  batch: QueueBatch,
  env: Env,
): Promise<void> {
  for (const message of batch.messages) {
    try {
      await handleScanJob(message.body, env);
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : String(error);
      console.error("[queue] unhandled message error:", errorText);
      throw error;
    }
  }
}

