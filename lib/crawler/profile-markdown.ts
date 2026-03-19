import "server-only";

export type { ProfilePlatform } from "./profile-markdown-types";

import { PROVIDERS } from "./profile-markdown-providers";
import type { ProfilePlatform } from "./profile-markdown-types";

export async function getProfileMarkdown(
  url: string,
  platform: ProfilePlatform,
): Promise<string> {
  let lastError: unknown = null;

  for (const provider of PROVIDERS) {
    try {
      return await provider.fetchMarkdown({ url, platform });
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError instanceof Error) throw lastError;
  throw new Error("Failed to crawl profile markdown from all providers");
}
