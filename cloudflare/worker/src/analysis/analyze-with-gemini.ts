import { GoogleGenAI } from "@google/genai";
import {
  ANALYSIS_RESPONSE_SCHEMA,
  buildAnalysisPrompt,
  type ProfileAnalysisResult,
} from "@/lib/ai/prompts/analyze-profile";
import type { CrawledProfile } from "@/lib/crawler/parse-profile";
import { withTimeout, clampScore } from "../utils";
import { MODEL } from "../constants";
import type { Env } from "../worker-types";

export async function analyzeWithGemini(input: {
  env: Env;
  profile: CrawledProfile;
}): Promise<{
  profileScore: number;
  visibilityScore: number;
  conversionScore: number;
  trustScore: number;
  completenessScore: number;
  summary: string | null;
}> {
  const { env, profile } = input;

  const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  const prompt = buildAnalysisPrompt(profile);

  const response = await withTimeout(
    genAI.models.generateContent({
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

  const text = response?.text as string | undefined;
  if (!text) throw new Error("Empty response from AI model");

  const parsed = JSON.parse(text) as ProfileAnalysisResult;

  return {
    profileScore: clampScore(Number(parsed.profileScore)),
    visibilityScore: clampScore(Number(parsed.visibilityScore)),
    conversionScore: clampScore(Number(parsed.conversionScore)),
    trustScore: clampScore(Number(parsed.trustScore)),
    completenessScore: clampScore(Number(parsed.completenessScore)),
    summary: parsed.summary ?? null,
  };
}

