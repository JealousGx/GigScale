import "server-only";

import { withTimeout } from "@/lib/utils/timeout";

import { firecrawl } from ".";

const CRAWL_TIMEOUT_MS = 30_000;

export interface CrawledProfile {
  title: string;
  description: string;
  platform: "upwork" | "fiverr";
  url: string;
  rawMarkdown: string;
  skills: string[];
  reviewRating: number;
  reviewCount: number;
  portfolioCount: number;
  hourlyRate: string | null;
  completedJobs: number | null;
  memberSince: string | null;
  location: string | null;
}

export async function extractProfile(
  url: string,
  platform: "upwork" | "fiverr",
): Promise<CrawledProfile> {
  const result = await withTimeout(
    firecrawl.scrape(url, { formats: ["markdown"], waitFor: 3000 }),
    CRAWL_TIMEOUT_MS,
    "Profile crawl",
  );

  const markdown = result.markdown ?? "";

  if (!markdown) {
    throw new Error("Failed to crawl profile: no content returned");
  }

  return {
    title: extractTitle(markdown, platform),
    description: extractDescription(markdown),
    platform,
    url,
    rawMarkdown: markdown,
    skills: extractSkills(markdown),
    reviewRating: extractNumber(markdown, /(\d+\.\d+)\s*(?:\/\s*5|stars?|rating)/i) ?? 0,
    reviewCount: extractInt(markdown, /(\d+)\s*(?:reviews?|feedback|ratings?)/i) ?? 0,
    portfolioCount: extractInt(markdown, /(\d+)\s*(?:portfolio|projects?|works?|gigs?)/i) ?? 0,
    hourlyRate: extractMatch(markdown, /\$(\d+(?:\.\d{2})?)\s*\/?\s*h(?:ou)?r/i),
    completedJobs: extractInt(markdown, /(\d+)\s*(?:jobs?|orders?)\s*(?:completed|done|finished)/i),
    memberSince: extractMatch(markdown, /(?:member\s+since|joined)\s*:?\s*(\w+\s+\d{4})/i),
    location: extractMatch(markdown, /(?:location|based\s+in|from)\s*:?\s*([A-Z][a-zA-Z\s,]+)/),
  };
}

function extractTitle(md: string, platform: string): string {
  const lines = md.split("\n").filter((l) => l.trim());
  const heading = lines.find((l) => /^#{1,2}\s/.test(l));
  if (heading) return heading.replace(/^#+\s*/, "").trim();
  return `${platform.charAt(0).toUpperCase() + platform.slice(1)} Profile`;
}

function extractDescription(md: string): string {
  const lines = md.split("\n");
  const paragraphs = lines
    .filter((l) => l.trim().length > 50 && !l.startsWith("#"))
    .slice(0, 5);
  return paragraphs.join("\n\n").trim() || "No description available";
}

function extractSkills(md: string): string[] {
  const skillSection = md.match(
    /(?:skills?|expertise|technologies)\s*:?\s*\n?([\s\S]*?)(?:\n#{1,3}\s|\n\n\n)/i,
  );
  if (skillSection?.[1]) {
    return skillSection[1]
      .split(/[,\n•·|]/)
      .map((s) => s.replace(/^[-*]\s*/, "").trim())
      .filter((s) => s.length > 1 && s.length < 50);
  }
  return [];
}

function extractNumber(md: string, pattern: RegExp): number | null {
  const match = md.match(pattern);
  return match ? parseFloat(match[1]) : null;
}

function extractInt(md: string, pattern: RegExp): number | null {
  const match = md.match(pattern);
  return match ? parseInt(match[1], 10) : null;
}

function extractMatch(md: string, pattern: RegExp): string | null {
  const match = md.match(pattern);
  return match?.[1]?.trim() ?? null;
}
