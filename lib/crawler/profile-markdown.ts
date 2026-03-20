import "server-only";

export type { ProfilePlatform } from "./profile-markdown-types";

import { PROVIDERS } from "./profile-markdown-providers";
import type { ProfilePlatform } from "./profile-markdown-types";
import {
  type ProviderErrorKind,
  ProviderFetchError,
} from "./provider-fetch-error";

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

      if (err instanceof ProviderFetchError) {
        const kind: ProviderErrorKind = err.kind;
        // `quota_exhausted` + `transient_failure` should move to the next provider.
        if (kind === "fatal") throw err;
      } else {
        // Unknown errors: treat as transient so we still try the next provider.
      }
    }
  }

  if (lastError instanceof Error) throw lastError;
  throw new Error("Failed to crawl profile markdown from all providers");
}
