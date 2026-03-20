import type { CrawledProfile } from "./parse-profile";

export type ProfileQualityAssessment = {
  isUsable: boolean;
  score: number;
  reasons: string[];
};

const DEFAULT_TITLE_PATTERNS = [/^upwork profile$/i, /^fiverr profile$/i];
const ACCEPTABLE_SCORE_THRESHOLD = 45;
const MIN_SCORE_WITH_JSONLD = 25;

function hasJsonLd(rawMarkdown: string): boolean {
  return /<script\b[^>]*type=["']application\/ld\+json["']/i.test(rawMarkdown);
}

export function assessProfileQuality(
  profile: CrawledProfile,
): ProfileQualityAssessment {
  let score = 0;
  const reasons: string[] = [];
  const jsonLdPresent = hasJsonLd(profile.rawMarkdown);

  const normalizedDescription = profile.description.trim();
  if (normalizedDescription.length >= 500) score += 35;
  else if (normalizedDescription.length >= 250) score += 25;
  else if (normalizedDescription.length >= 120) score += 10;
  else if (!jsonLdPresent) reasons.push("description too short");

  if (profile.skills.length >= 8) score += 20;
  else if (profile.skills.length >= 3) score += 12;
  else if (profile.skills.length > 0) score += 6;
  else if (!jsonLdPresent) reasons.push("skills missing");

  if (profile.reviewCount > 0) score += 10;
  if (profile.portfolioCount > 0) score += 10;
  if (profile.hourlyRate) score += 5;
  if (profile.completedJobs && profile.completedJobs > 0) score += 5;
  if (profile.memberSince) score += 3;
  if (profile.location) score += 2;

  if (!DEFAULT_TITLE_PATTERNS.some((pattern) => pattern.test(profile.title))) {
    score += 10;
  } else {
    reasons.push("title appears generic");
  }

  if (jsonLdPresent) score += 25;
  if (profile.rawMarkdown.trim().length >= 3500) score += 10;
  else if (profile.rawMarkdown.trim().length < 1200 && !jsonLdPresent)
    reasons.push("raw markdown too thin");

  const threshold = jsonLdPresent
    ? Math.min(ACCEPTABLE_SCORE_THRESHOLD, MIN_SCORE_WITH_JSONLD)
    : ACCEPTABLE_SCORE_THRESHOLD;

  return {
    isUsable: score >= threshold,
    score,
    reasons,
  };
}
