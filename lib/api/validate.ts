import type { ZodType } from "zod";
import { badRequest } from "./response";

export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<{ data: T } | { error: ReturnType<typeof badRequest> }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { error: badRequest("Invalid JSON body") };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const msg = result.error.issues.map((i) => i.message).join("; ");
    return { error: badRequest(msg) };
  }

  return { data: result.data };
}
