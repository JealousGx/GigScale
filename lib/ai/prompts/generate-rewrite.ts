import type { ProfileAnalysisResult } from "./analyze-profile";

export type RewriteType = "headline" | "description" | "gig";
export type RewriteMode =
  | "seo_optimization"
  | "conversion_optimization"
  | "premium_client_targeting"
  | "clarity_improvement";

export interface RewriteResult {
  rewrittenText: string;
}

export const REWRITE_RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    rewrittenText: {
      type: "string" as const,
      description: "The rewritten text optimized according to the specified mode",
    },
  },
  required: ["rewrittenText"],
};

const MODE_INSTRUCTIONS: Record<RewriteMode, string> = {
  seo_optimization: `**Goal: Maximize search ranking and discoverability on the platform.**

Optimization rules:
- Research what clients ACTUALLY type when searching for this service. Use those exact phrases.
- Front-load the most important keyword in the first 10 words
- Use natural keyword density (2-3% for primary keyword, 1% for secondary)
- Include long-tail keyword variations that match different search intents
- For headlines: place primary keyword before any separator ("|", "—", "-")
- For descriptions: use the primary keyword in the first sentence, first paragraph, and at least once more in the body
- Avoid keyword stuffing — the text must read naturally to humans first
- Include semantic variations (e.g., "web development" → "web development, website building, web apps")
- Structure descriptions with scannable formatting that also serves SEO (keyword-rich bullet points)`,

  conversion_optimization: `**Goal: Maximize the percentage of profile visitors who reach out or place an order.**

Optimization rules:
- Open with the client's PAIN POINT, not the freelancer's credentials. The client thinks "do they understand my problem?" before "are they qualified?"
- Within the first 2 sentences, the client must think: "This person gets it. They can solve my problem."
- Use the PAS framework: Problem → Agitation → Solution
- Include at least one specific metric or result (e.g., "increased conversion by 47%", "delivered 200+ projects")
- Use second-person language ("You need...", "Your project...", "You'll get...")
- Remove every sentence that doesn't serve the client — no filler, no padding
- End with a clear, low-friction CTA ("Message me with your project details and I'll respond within 2 hours")
- For pricing/packages: anchor high, then present the middle tier as the obvious choice
- Use power words: guarantee, proven, exclusive, transform, dedicated, results-driven`,

  premium_client_targeting: `**Goal: Attract high-budget clients ($5K-$100K+ projects) and enterprise decision-makers.**

Optimization rules:
- Write like a consultant, not a freelancer. Premium clients hire partners, not vendors.
- Lead with strategic value and business outcomes, not technical skills
- Use language from the client's industry: "ROI", "stakeholder alignment", "scalable architecture", "technical debt reduction"
- Emphasize depth over breadth — specialize ruthlessly. "I build enterprise SaaS dashboards" beats "I do web development"
- Reference comparable clients/industries without naming them: "For a Fortune 500 fintech client, I..."
- Avoid price anchoring to low numbers. Never mention hourly rates in descriptions.
- Signal selectivity: "I take on 2-3 projects per quarter to ensure dedicated focus"
- Include process description: discovery → strategy → execution → iteration. Premium clients pay for process.
- Remove anything that screams "budget freelancer": generic phrases, desperate availability, "I can do anything" positioning`,

  clarity_improvement: `**Goal: Make every word earn its place. Maximum clarity, minimum fluff.**

Optimization rules:
- Cut word count by 30-40% while preserving ALL meaningful information
- Replace every passive voice construction with active voice
- Eliminate: "I am a...", "I have experience in...", "I am passionate about...", "I specialize in..." → Start with action verbs
- One idea per sentence. If a sentence has "and" connecting two different ideas, split it.
- Replace vague claims with specific ones: "many years" → "8 years", "various clients" → "Fortune 500 companies and YC startups"
- Remove filler words: very, really, just, actually, basically, honestly, literally
- Front-load each paragraph with its key message (inverted pyramid)
- Use short paragraphs (2-3 sentences max) and bullet points for lists of 3+ items
- Read it aloud — if you stumble, rewrite that sentence`,
};

const TYPE_CONTEXT: Record<RewriteType, string> = {
  headline: `This is a profile HEADLINE/TITLE — the single most important line on the entire profile.

Requirements:
- Maximum 70-80 characters (platform truncates beyond this in search results)
- Must contain the primary skill keyword in the first 3-4 words
- Should communicate: what you do + who you do it for OR what you do + what makes you different
- Format options: "Primary Skill | Specialization | Differentiator" or "Primary Skill for [Client Type] — [Result]"
- NO emojis, NO all-caps, NO exclamation marks
- This headline appears in search results, proposals, and profile cards — it's the first thing clients read`,

  description: `This is a profile DESCRIPTION/OVERVIEW — the primary selling copy.

Requirements:
- 300-600 words (shorter loses credibility, longer loses readers)
- First 2 sentences appear in search previews — they MUST hook
- Structure: Hook → Credibility → Services → Process → CTA
- Use short paragraphs (2-3 sentences) with line breaks between them
- Include 3-5 bullet points for services/specializations (scannable)
- End with a specific call-to-action that reduces friction
- Write in first person, conversational but professional tone
- Every sentence must pass the "so what?" test from the client's perspective`,

  gig: `This is a GIG/SERVICE DESCRIPTION — a specific offering page.

Requirements:
- Lead with what the CLIENT GETS (deliverables), not what you'll do
- Include: scope, deliverables, timeline, what's included in each tier
- Address the top 3 objections buyers have for this service
- Use formatting: headers, bullet points, bold for emphasis
- Include a "What You'll Receive" section with specific deliverables
- End with urgency or reassurance: "Order now and I'll start within 24 hours" or "100% revision guarantee"
- Keep paragraphs to 2-3 lines — gig descriptions are read on mobile`,
};

interface RewritePromptInput {
  originalText: string;
  type: RewriteType;
  mode: RewriteMode;
  platform: "upwork" | "fiverr";
  analysisScores?: ProfileAnalysisResult | null;
}

export function buildRewritePrompt(input: RewritePromptInput): string {
  const { originalText, type, mode, platform, analysisScores } = input;
  const platformName = platform === "upwork" ? "Upwork" : "Fiverr";

  let analysisContext = "";
  if (analysisScores) {
    const weakest = getWeakestArea(analysisScores);
    analysisContext = `
## Profile Analysis Context (use this to inform your rewrite)

This freelancer's profile was analyzed and scored:
- Overall: ${analysisScores.profileScore}/100
- Visibility: ${analysisScores.visibilityScore}/100
- Conversion: ${analysisScores.conversionScore}/100
- Trust: ${analysisScores.trustScore}/100
- Completeness: ${analysisScores.completenessScore}/100

**Weakest area: ${weakest.name} (${weakest.score}/100)**

${analysisScores.summary ? `**Analysis summary:** ${analysisScores.summary}` : ""}

Your rewrite should specifically address the weaknesses identified above while maintaining the selected optimization mode. If the weakest area is visibility, integrate more searchable keywords. If conversion, strengthen the value proposition and CTA. If trust, add credibility markers. If completeness, ensure all expected sections are represented.`;
  }

  return `You are the highest-paid freelance copywriter on ${platformName}. Your rewrites consistently transform average profiles into top-performers that rank on page 1 and convert at 3-5x the platform average. You understand ${platformName}'s algorithm, client psychology, and what separates profiles that earn $10K/month from those that earn $1K/month.

A freelancer has paid for your premium rewrite service. Deliver your absolute best work.

## Content Type
${TYPE_CONTEXT[type]}

## Optimization Mode
${MODE_INSTRUCTIONS[mode]}
${analysisContext}

## Critical Rules
1. **Preserve authenticity** — keep the freelancer's genuine voice and personality. Enhance, don't replace.
2. **Factual accuracy** — NEVER fabricate skills, years of experience, client names, or metrics that aren't in the original text.
3. **Platform awareness** — write specifically for ${platformName}. What works on Upwork doesn't always work on Fiverr.
4. **No emojis** unless the original text already uses them (and only on Fiverr where they're culturally acceptable).
5. **No meta-commentary** — output ONLY the rewritten text. No "Here's your rewrite:" or explanations.
6. **The rewrite must be DRAMATICALLY better** — not a light edit. The freelancer should read it and think "This is exactly what I wanted to say but couldn't."

---

**Original ${type} text:**
${originalText}

---

Respond ONLY with the JSON object matching the required schema.`;
}

function getWeakestArea(scores: ProfileAnalysisResult): { name: string; score: number } {
  const areas = [
    { name: "Visibility", score: scores.visibilityScore },
    { name: "Conversion", score: scores.conversionScore },
    { name: "Trust", score: scores.trustScore },
    { name: "Completeness", score: scores.completenessScore },
  ];
  return areas.reduce((w, a) => (a.score < w.score ? a : w));
}
