import type { ProfilePlatform } from "./profile-markdown-types";

export interface CrawledProfile {
  title: string;
  description: string;
  platform: ProfilePlatform;
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

export function parseProfileMarkdown(
  markdown: string,
  url: string,
  platform: ProfilePlatform,
): CrawledProfile {
  const rawMarkdown = markdown;

  return {
    title: extractTitle(rawMarkdown, platform),
    description: extractDescription(rawMarkdown),
    platform,
    url,
    rawMarkdown,
    skills: extractSkills(rawMarkdown),
    reviewRating:
      extractNumber(rawMarkdown, /(\d+\.\d+)\s*(?:\/\s*5|stars?|rating)/i) ?? 0,
    reviewCount:
      extractInt(rawMarkdown, /(\d+)\s*(?:reviews?|feedback|ratings?)/i) ?? 0,
    portfolioCount:
      extractInt(
        rawMarkdown,
        /(\d+)\s*(?:portfolio|projects?|works?|gigs?)/i,
      ) ?? 0,
    hourlyRate: extractMatch(
      rawMarkdown,
      /\$(\d+(?:\.\d{2})?)\s*\/?\s*h(?:ou)?r/i,
    ),
    completedJobs: extractInt(
      rawMarkdown,
      /(\d+)\s*(?:jobs?|orders?)\s*(?:completed|done|finished)/i,
    ),
    memberSince: extractMatch(
      rawMarkdown,
      /(?:member\s+since|joined)\s*:?\s*(\w+\s+\d{4})/i,
    ),
    location: extractMatch(
      rawMarkdown,
      /(?:location|based\s+in|from)\s*:?\s*([A-Z][a-zA-Z\s,]+)/,
    ),
  };
}

function extractTitle(md: string, platform: ProfilePlatform): string {
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
