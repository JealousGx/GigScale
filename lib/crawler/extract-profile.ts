import "server-only";

import { getProfileMarkdown, type ProfilePlatform } from "./profile-markdown";

export type { CrawledProfile } from "./parse-profile";
export { parseProfileMarkdown } from "./parse-profile";

import {
  type CrawledProfile,
  parseProfileMarkdown as parseProfileMarkdownFn,
} from "./parse-profile";

export async function extractProfile(
  url: string,
  platform: ProfilePlatform,
): Promise<CrawledProfile> {
  const markdown = await getProfileMarkdown(url, platform);

  if (!markdown) {
    throw new Error("Failed to crawl profile: no content returned");
  }

  return parseProfileMarkdownFn(markdown, url, platform);
}
