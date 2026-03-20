import type { ProfileAnalysisResult } from "./analyze-profile";

export interface SuggestionItem {
  title: string;
  description: string;
  recommendedFix: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface SuggestionsResult {
  suggestions: SuggestionItem[];
}

export const SUGGESTIONS_RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    suggestions: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          title: { type: "string" as const, description: "Short, actionable title (verb-first)" },
          description: { type: "string" as const, description: "2-3 sentences explaining why this matters" },
          recommendedFix: { type: "string" as const, description: "Step-by-step instructions with concrete examples" },
          priority: {
            type: "string" as const,
            enum: ["critical", "high", "medium", "low"],
            description: "Impact-based priority",
          },
        },
        required: ["title", "description", "recommendedFix", "priority"],
      },
    },
  },
  required: ["suggestions"],
};

const PLATFORM_BEST_PRACTICES: Record<string, string> = {
  upwork: `Top 1% Upwork profiles: keyword-rich title "[Skill] | [Specialization] | [Result]", client-focused opening, short paragraphs + bullets, all 15 skill tags, portfolio with problem→solution→result, specialized profile, video intro (+30% views), availability always on.`,

  fiverr: `Top Fiverr sellers: "I will [keyword]" gig titles, 3+ gigs for keyword clusters, 3 images + 1 video per gig, 3-tier pricing, FAQ section, warm+authoritative profile, fast delivery enabled, gig extras for upsell, <1hr response time.`,
};

export interface SuggestionsProfileData {
  title: string;
  description: string;
  platform: "upwork" | "fiverr";
  skills: string[];
  reviewRating: number;
  reviewCount: number;
  portfolioCount: number;
  hourlyRate: string | null;
  completedJobs: number | null;
  location: string | null;
}

export function buildSuggestionsPrompt(
  profile: SuggestionsProfileData,
  analysis: ProfileAnalysisResult,
  evidenceContext: string | null | undefined,
  evidenceType: string | null | undefined,
): string {
  const platformName = profile.platform === "upwork" ? "Upwork" : "Fiverr";
  const bestPractices = PLATFORM_BEST_PRACTICES[profile.platform] ?? PLATFORM_BEST_PRACTICES.upwork;
  const weakest = getWeakestDimension(analysis);
  const evidenceLabel =
    evidenceType === "json_ld"
      ? "JSON-LD Evidence (curated)"
      : "Ranked Evidence Context (curated)";

  return `You are a premium ${platformName} profile consultant. Generate 6-8 specific, actionable suggestions to improve this freelancer's profile.

## Analysis Scores
Overall: ${analysis.profileScore}/100 | Visibility: ${analysis.visibilityScore}/100 | Conversion: ${analysis.conversionScore}/100 | Trust: ${analysis.trustScore}/100 | Completeness: ${analysis.completenessScore}/100
**Weakest: ${weakest.name} (${weakest.score}/100)** — prioritize this.

**Summary:** ${analysis.summary}

## Evidence (for references + quoting)
**${evidenceLabel}:**
${evidenceContext ?? "N/A"}

## ${platformName} Best Practices
${bestPractices}

## Priority Levels
- **critical**: Actively losing clients/ranking. Fix immediately.
- **high**: Significant competitive disadvantage. Noticeable impact in weeks.
- **medium**: Meaningful optimization. Difference between good and great.
- **low**: Polish after big wins are secured.

## Requirements
Each suggestion MUST: reference actual profile content, include concrete rewrite examples, explain WHY with data, provide step-by-step instructions. Order by impact.

---

**Title:** ${profile.title}
**Description:** ${profile.description}
**Skills:** ${profile.skills.length > 0 ? profile.skills.join(", ") : "NONE — critical gap"}
**Reviews:** ${profile.reviewRating}/5 (${profile.reviewCount} reviews)
**Portfolio:** ${profile.portfolioCount} items
**Rate:** ${profile.hourlyRate ?? "Not set"}
**Jobs:** ${profile.completedJobs ?? "Unknown"}
**Location:** ${profile.location ?? "Not listed"}

---

Respond ONLY with the JSON object.`;
}

function getWeakestDimension(analysis: ProfileAnalysisResult): { name: string; score: number } {
  const dimensions = [
    { name: "Visibility", score: analysis.visibilityScore },
    { name: "Conversion", score: analysis.conversionScore },
    { name: "Trust", score: analysis.trustScore },
    { name: "Completeness", score: analysis.completenessScore },
  ];
  return dimensions.reduce((weakest, dim) =>
    dim.score < weakest.score ? dim : weakest,
  );
}
