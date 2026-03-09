import "server-only";

import { gemini, MODEL } from "@/lib/ai";
import { withTimeout } from "@/lib/utils/timeout";
import type { ProfileAnalysisResult } from "@/lib/ai/prompts/analyze-profile";
import {
  buildRewritePrompt,
  REWRITE_RESPONSE_SCHEMA,
  type RewriteMode,
  type RewriteResult,
  type RewriteType,
} from "@/lib/ai/prompts/generate-rewrite";
import { insertRewrite } from "@/lib/db/queries/rewrites";

interface GenerateRewriteInput {
  profileId: string;
  type: RewriteType;
  mode: RewriteMode;
  originalText: string;
  platform: "upwork" | "fiverr";
  analysisScores?: ProfileAnalysisResult | null;
}

export async function generateRewrite(
  input: GenerateRewriteInput,
): Promise<NonNullable<Awaited<ReturnType<typeof insertRewrite>>>> {
  const prompt = buildRewritePrompt({
    originalText: input.originalText,
    type: input.type,
    mode: input.mode,
    platform: input.platform,
    analysisScores: input.analysisScores,
  });

  const response = await withTimeout(
    gemini.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: REWRITE_RESPONSE_SCHEMA,
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
    20_000,
    "AI rewrite generation",
  );

  const text = response.text;
  if (!text) throw new Error("Empty response from AI model");

  const parsed = JSON.parse(text) as RewriteResult;

  if (!parsed.rewrittenText || parsed.rewrittenText.trim().length === 0) {
    throw new Error("AI returned empty rewrite");
  }

  const rewrite = await insertRewrite({
    profileId: input.profileId,
    type: input.type,
    mode: input.mode,
    originalText: input.originalText,
    rewrittenText: parsed.rewrittenText.trim(),
  });

  if (!rewrite) throw new Error("Failed to save rewrite");

  return rewrite;
}
