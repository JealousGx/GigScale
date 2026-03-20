import "server-only";

import { gemini, MODEL } from "@/lib/ai";
import { withTimeout } from "@/lib/utils/timeout";
import {
  ANALYSIS_RESPONSE_SCHEMA,
  buildAnalysisPromptWithEvidence,
  type ProfileAnalysisResult,
  type AnalysisEvidenceType,
} from "@/lib/ai/prompts/analyze-profile";
import {
  type CrawledProfile,
  extractProfile,
} from "@/lib/crawler/extract-profile";
import { insertAnalysis } from "@/lib/db/queries/analyses";
import { insertProfile } from "@/lib/db/queries/profiles";

interface AnalyzeProfileInput {
  userId: string;
  profileUrl: string;
  platform: "upwork" | "fiverr";
}

interface AnalyzeProfileResult {
  profile: NonNullable<Awaited<ReturnType<typeof insertProfile>>>;
  analysis: NonNullable<Awaited<ReturnType<typeof insertAnalysis>>>;
}

export async function analyzeProfile(
  input: AnalyzeProfileInput,
): Promise<AnalyzeProfileResult> {
  const crawledProfile = await extractProfile(input.profileUrl, input.platform);

  const aiResult = await runAnalysis(crawledProfile);

  const profile = await insertProfile({
    userId: input.userId,
    platform: input.platform,
    profileUrl: input.profileUrl,
    profileTitle: crawledProfile.title,
    profileDescription: crawledProfile.description,
    reviewRating: crawledProfile.reviewRating.toFixed(2),
    reviewCount: crawledProfile.reviewCount,
    portfolioCount: crawledProfile.portfolioCount,
    crawlMeta: {
      skills: crawledProfile.skills,
      hourlyRate: crawledProfile.hourlyRate,
      completedJobs: crawledProfile.completedJobs,
      memberSince: crawledProfile.memberSince,
      location: crawledProfile.location,
    },
  });

  if (!profile) throw new Error("Failed to create profile");

  const analysis = await insertAnalysis({
    profileId: profile.id,
    profileScore: aiResult.profileScore.toFixed(2),
    visibilityScore: aiResult.visibilityScore.toFixed(2),
    conversionScore: aiResult.conversionScore.toFixed(2),
    trustScore: aiResult.trustScore.toFixed(2),
    completenessScore: aiResult.completenessScore.toFixed(2),
    summary: aiResult.summary,
    analysisEvidenceContext: aiResult.evidenceContext,
    analysisEvidenceType: aiResult.evidenceType,
  });

  if (!analysis) throw new Error("Failed to create analysis");

  return { profile, analysis };
}

async function runAnalysis(
  profile: CrawledProfile,
): Promise<
  ProfileAnalysisResult & {
    evidenceContext: string;
    evidenceType: AnalysisEvidenceType;
  }
> {
  const { prompt, evidenceContext, evidenceType } =
    buildAnalysisPromptWithEvidence(profile);

  const response = await withTimeout(
    gemini.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_RESPONSE_SCHEMA,
        temperature: 0.3,
        maxOutputTokens: 512,
      },
    }),
    20_000,
    "AI analysis",
  );

  const text = response.text;
  if (!text) throw new Error("Empty response from AI model");

  const parsed = JSON.parse(text) as ProfileAnalysisResult;

  return {
    profileScore: clampScore(parsed.profileScore),
    visibilityScore: clampScore(parsed.visibilityScore),
    conversionScore: clampScore(parsed.conversionScore),
    trustScore: clampScore(parsed.trustScore),
    completenessScore: clampScore(parsed.completenessScore),
    summary: parsed.summary,
    evidenceContext,
    evidenceType,
  };
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score * 100) / 100));
}
