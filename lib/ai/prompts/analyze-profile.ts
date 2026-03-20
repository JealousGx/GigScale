import type { CrawledProfile } from "@/lib/crawler/extract-profile";

export interface ProfileAnalysisResult {
  profileScore: number;
  visibilityScore: number;
  conversionScore: number;
  trustScore: number;
  completenessScore: number;
  summary: string;
}

export const ANALYSIS_RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    profileScore: { type: "number" as const, description: "Overall profile quality score 0-100" },
    visibilityScore: { type: "number" as const, description: "How discoverable/SEO-optimized the profile is 0-100" },
    conversionScore: { type: "number" as const, description: "How likely the profile converts visitors to clients 0-100" },
    trustScore: { type: "number" as const, description: "How trustworthy/credible the profile appears 0-100" },
    completenessScore: { type: "number" as const, description: "How complete the profile sections are 0-100" },
    summary: { type: "string" as const, description: "3-5 sentence analysis covering key strengths, critical weaknesses, and highest-impact improvement areas" },
  },
  required: [
    "profileScore",
    "visibilityScore",
    "conversionScore",
    "trustScore",
    "completenessScore",
    "summary",
  ],
};

const PLATFORM_CRITERIA: Record<string, string> = {
  upwork: `### Upwork-Specific Scoring Criteria

**Visibility (Upwork Search Algorithm):**
- Upwork's search ranks profiles by: Job Success Score, keyword relevance in title + overview, skills tags (max 15), responsiveness, and activity recency
- Title must contain the EXACT phrases clients search for (e.g., "React Developer" not "Code Artisan")
- First 2 sentences of overview appear in search results — they must hook immediately
- Skills tags must match job posting keywords, not generic terms
- Specialized profiles rank higher than generalist profiles

**Conversion (Client Decision-Making):**
- Clients on Upwork scan 10-20 profiles in under 60 seconds — the overview must pass the 5-second test
- Opening sentence must address the CLIENT's problem, not the freelancer's background
- Must include: specific results/metrics, relevant technologies, clear process description
- Portfolio items with descriptions dramatically outperform those without
- A specific, justified hourly rate signals confidence; too low signals inexperience

**Trust Signals (Upwork-Specific):**
- Job Success Score (JSS) above 90% is expected; below 80% is a red flag
- Top Rated / Top Rated Plus badges significantly boost trust
- Earnings history and hours worked are visible to clients
- Long-term contracts signal reliability
- Response time under 12 hours is critical for initial contact

**Completeness (Upwork Profile Sections):**
- Title (70 chars max, keyword-optimized)
- Professional overview (minimum 500 words for serious freelancers)
- Skills tags (use all 15 slots)
- Portfolio (minimum 4 items with detailed descriptions)
- Employment history & education
- Certifications (if applicable)
- Video introduction (major differentiator)
- Availability badge and hours/week`,

  fiverr: `### Fiverr-Specific Scoring Criteria

**Visibility (Fiverr Search Algorithm):**
- Fiverr ranks gigs by: relevance, conversion rate, seller level, response time, and recency
- Gig title must start with "I will" followed by the exact service keyword clients search
- Tags (up to 5 per gig) must be high-volume search terms, not niche jargon
- Gig images/thumbnails directly impact click-through rate — professional, branded images rank higher
- Multiple gigs targeting different keyword clusters maximize overall visibility
- Category and subcategory selection must match the primary keyword intent

**Conversion (Buyer Decision-Making):**
- Fiverr buyers compare 3-5 gigs side by side — pricing, delivery time, and thumbnail are the first filters
- Gig description must: open with the deliverable, include FAQ-style objection handling, and end with urgency
- 3-tier pricing (Basic/Standard/Premium) with clearly differentiated value dramatically increases order value
- Gig extras and fast delivery options signal professionalism
- Buyer requirements that are too complex reduce orders

**Trust Signals (Fiverr-Specific):**
- Seller Level (New, Level 1, Level 2, Top Rated) is the primary trust indicator
- Order completion rate above 90% is mandatory for level maintenance
- Response time must be under 1 hour for competitive niches
- Review quality (not just quantity) matters — detailed reviews with buyer photos boost trust
- "Seller communication" rating is weighted heavily by buyers

**Completeness (Fiverr Profile + Gig Sections):**
- Profile description (professional, with personality)
- At least 3 active gigs targeting different keywords
- Gig gallery: 3 images + 1 video per gig (video gigs get 40% more orders)
- Gig FAQ section (minimum 3 questions)
- Gig packages with clear deliverables and realistic timelines
- Skills and education sections filled
- Languages listed
- Linked social accounts for credibility`,
};

const MAX_TITLE_CHARS = 180;
const MAX_DESCRIPTION_CHARS = 1800;
const MAX_SKILLS = 20;
const MAX_SKILL_CHARS = 40;
const MAX_EVIDENCE_CHARS = 2600;

function compactWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function sliceSafe(input: string | null | undefined, maxChars: number): string {
  if (!input) return "";
  return compactWhitespace(input).slice(0, maxChars);
}

function extractJsonLdBlocks(raw: string): string[] {
  const blocks: string[] = [];
  const re =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  for (const match of raw.matchAll(re)) {
    const content = (match[1] ?? "").trim();
    if (!content) continue;
    blocks.push(content);
    if (blocks.length >= 3) break;
  }

  return blocks;
}

function stripNonEssentialHtml(raw: string): string {
  let s = raw;
  // Remove HTML comments first (often huge)
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  // Remove low-value chrome
  s = s.replace(/<head\b[\s\S]*?<\/head>/gi, "");
  s = s.replace(/<nav\b[\s\S]*?<\/nav>/gi, "");
  s = s.replace(/<footer\b[\s\S]*?<\/footer>/gi, "");

  // Remove visual clutter
  s = s.replace(/<svg\b[\s\S]*?<\/svg>/gi, "");
  s = s.replace(/<svg\b[^>]*\/>/gi, "");

  // Remove styles + scripts (we always separately extract JSON-LD)
  s = s.replace(/<style\b[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<script\b[^>]*\/>/gi, "");

  return s;
}

function buildJsonLdEvidence(raw: string): string | null {
  const blocks = extractJsonLdBlocks(raw);
  if (blocks.length === 0) return null;

  let budget = MAX_EVIDENCE_CHARS;
  const picked: string[] = [];

  for (const block of blocks) {
    if (budget <= 100) break;
    const compact = compactWhitespace(block);
    const clipped = compact.slice(0, Math.min(1500, budget));
    if (!clipped) continue;
    picked.push(clipped);
    budget -= clipped.length + 2;
  }

  return picked.join("\n\n");
}

function buildEvidenceContext(rawMarkdown: string): string {
  const normalized = rawMarkdown.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  const sections = normalized
    .split(/\n(?=#{1,6}\s)/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const weighted = sections.map((section) => {
    const headingLine = section.split("\n")[0] ?? "";
    const heading = headingLine.replace(/^#{1,6}\s*/, "").toLowerCase();
    let weight = 1;

    if (/(overview|summary|about|description)/i.test(heading)) weight += 4;
    if (/(skills?|expertise|tech|stack)/i.test(heading)) weight += 4;
    if (/(portfolio|project|work|case)/i.test(heading)) weight += 3;
    if (/(review|feedback|rating|testimonial)/i.test(heading)) weight += 3;
    if (/(experience|employment|history)/i.test(heading)) weight += 2;

    return { section, weight };
  });

  weighted.sort((a, b) => b.weight - a.weight);

  let budget = MAX_EVIDENCE_CHARS;
  const picked: string[] = [];
  const seen = new Set<string>();

  for (const candidate of weighted) {
    if (budget <= 100) break;
    const compact = compactWhitespace(candidate.section);
    if (!compact || seen.has(compact)) continue;

    const clipped = compact.slice(0, Math.min(compact.length, 700, budget));
    if (clipped.length < 60) continue;

    picked.push(clipped);
    seen.add(compact);
    budget -= clipped.length + 2;
  }

  if (picked.length === 0) {
    return compactWhitespace(normalized).slice(0, MAX_EVIDENCE_CHARS);
  }

  return picked.join("\n\n");
}

export type AnalysisEvidenceType = "json_ld" | "ranked_html";

export function buildAnalysisPromptWithEvidence(profile: CrawledProfile): {
  prompt: string;
  evidenceContext: string;
  evidenceType: AnalysisEvidenceType;
} {
  const jsonLdEvidence = buildJsonLdEvidence(profile.rawMarkdown);
  const evidenceType: AnalysisEvidenceType = jsonLdEvidence
    ? "json_ld"
    : "ranked_html";

  const evidenceContext = jsonLdEvidence
    ? jsonLdEvidence
    : buildEvidenceContext(stripNonEssentialHtml(profile.rawMarkdown));

  return {
    prompt: buildAnalysisPrompt(profile),
    evidenceContext,
    evidenceType,
  };
}

export function buildAnalysisPrompt(profile: CrawledProfile): string {
  const platformName = profile.platform === "upwork" ? "Upwork" : "Fiverr";
  const criteria = PLATFORM_CRITERIA[profile.platform] ?? PLATFORM_CRITERIA.upwork;
  const normalizedTitle = sliceSafe(profile.title, MAX_TITLE_CHARS);
  const normalizedDescription = sliceSafe(
    profile.description,
    MAX_DESCRIPTION_CHARS,
  );
  const normalizedSkills = profile.skills
    .map((skill) => sliceSafe(skill, MAX_SKILL_CHARS))
    .filter(Boolean)
    .slice(0, MAX_SKILLS);
  const jsonLdEvidence = buildJsonLdEvidence(profile.rawMarkdown);

  const evidenceLabel = jsonLdEvidence
    ? "JSON-LD (application/ld+json) Evidence (curated):"
    : "Ranked Evidence Context (curated):";

  const evidenceContext = jsonLdEvidence
    ? jsonLdEvidence
    : buildEvidenceContext(stripNonEssentialHtml(profile.rawMarkdown));

  return `You are a world-class freelance profile strategist who has personally optimized over 10,000 profiles on ${platformName}. You understand the platform's search algorithm, client psychology, and exactly what separates top 1% earners from the rest.

Your job is to provide a brutally honest, data-driven analysis of the profile below. Do NOT be generous — clients' livelihoods depend on accurate scoring. A mediocre profile scored as "good" helps no one.

## Scoring Dimensions (each 0-100)

${criteria}

## Scoring Calibration

- **0-20**: Severely deficient. Missing critical sections, unprofessional, or actively harmful to the freelancer's chances.
- **21-40**: Below average. Significant gaps that most competing profiles don't have.
- **41-60**: Average. Functional but unremarkable. Will lose to better-optimized competitors.
- **61-75**: Above average. Solid foundation with room for meaningful improvement.
- **76-85**: Strong. Well-optimized with only minor gaps remaining.
- **86-95**: Excellent. Top 10% of the platform. Only fine-tuning needed.
- **96-100**: Reserved for profiles that are essentially perfect. Almost no real profile achieves this.

The **profileScore** is NOT an average of the other four. It's a holistic assessment weighted toward conversion and visibility (since those directly impact earnings).

## Summary Requirements

Write 3-5 sentences that:
1. Lead with the single most impactful thing the freelancer is doing WRONG
2. Acknowledge 1-2 genuine strengths
3. Identify the highest-ROI change they could make today
4. Reference specific content from the profile (quote actual phrases when relevant)

---

**Profile Title:** ${normalizedTitle}

**Platform:** ${platformName}

**Description:**
${normalizedDescription}

**Skills:** ${normalizedSkills.length > 0 ? normalizedSkills.join(", ") : "None listed — this is a CRITICAL gap"}

**Reviews:** ${profile.reviewRating}/5 from ${profile.reviewCount} reviews${profile.reviewCount === 0 ? " (new profile — factor this into trust scoring)" : ""}

**Portfolio Items:** ${profile.portfolioCount}${profile.portfolioCount === 0 ? " (none — this is a CRITICAL gap)" : ""}

**Hourly Rate:** ${profile.hourlyRate ?? "Not set"}

**Completed Jobs:** ${profile.completedJobs ?? "Unknown"}

**Member Since:** ${profile.memberSince ?? "Unknown"}

**Location:** ${profile.location ?? "Not listed"}

**${evidenceLabel}**
${evidenceContext}

---

Respond ONLY with the JSON object matching the required schema. No markdown, no commentary.`;
}
