import "server-only";

import { getProfileMarkdown, type ProfilePlatform } from "./profile-markdown";

export { parseProfileMarkdown } from "./parse-profile";
export type { CrawledProfile } from "./parse-profile";

import {
  type CrawledProfile,
  parseProfileMarkdown as parseProfileMarkdownFn,
} from "./parse-profile";
import { assessProfileQuality } from "./profile-quality";

export async function extractProfile(
  url: string,
  platform: ProfilePlatform,
): Promise<CrawledProfile> {
  const markdown = await getProfileMarkdown(url, platform);

  console.log(
    `Crawled profile from ${url} (platform=${platform}): ${markdown}`,
  );

  if (!markdown) {
    throw new Error("Failed to crawl profile: no content returned");
  }

  const profile = parseProfileMarkdownFn(markdown, url, platform);
  const quality = assessProfileQuality(profile);
  if (!quality.isUsable) {
    throw new Error(
      `Crawled profile quality too low (score=${quality.score}, reasons=${quality.reasons.join(", ") || "none"})`,
    );
  }
  return profile;
}
