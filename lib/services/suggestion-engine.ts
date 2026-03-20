import "server-only";

import { gemini, MODEL } from "@/lib/ai";
import type { ProfileAnalysisResult } from "@/lib/ai/prompts/analyze-profile";
import {
  buildSuggestionsPrompt,
  SUGGESTIONS_RESPONSE_SCHEMA,
  type SuggestionItem,
  type SuggestionsProfileData,
  type SuggestionsResult,
} from "@/lib/ai/prompts/generate-suggestions";
import { insertSuggestions } from "@/lib/db/queries/suggestions";
import { withTimeout } from "@/lib/utils/timeout";

const VALID_PRIORITIES = new Set(["critical", "high", "medium", "low"]);

interface GenerateSuggestionsInput {
  analysisId: string;
  profile: SuggestionsProfileData;
  analysisScores: ProfileAnalysisResult;
  analysisEvidenceContext?: string | null;
  analysisEvidenceType?: string | null;
}

export async function generateSuggestions(
  input: GenerateSuggestionsInput,
): Promise<Awaited<ReturnType<typeof insertSuggestions>>> {
  const prompt = buildSuggestionsPrompt(
    input.profile,
    input.analysisScores,
    input.analysisEvidenceContext,
    input.analysisEvidenceType,
  );

  const response = await withTimeout(
    gemini.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: SUGGESTIONS_RESPONSE_SCHEMA,
        temperature: 0.5,
        maxOutputTokens: 2048,
      },
    }),
    25_000,
    "AI suggestion generation",
  );

  const text = response.text;
  if (!text) throw new Error("Empty response from AI model");

  const parsed = JSON.parse(text) as SuggestionsResult;

  if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length === 0) {
    throw new Error("AI returned no suggestions");
  }

  const validated: Array<{
    analysisId: string;
    title: string;
    description: string;
    recommendedFix: string;
    priority: "critical" | "high" | "medium" | "low";
  }> = parsed.suggestions
    .filter(
      (s: SuggestionItem) =>
        s.title &&
        s.description &&
        s.recommendedFix &&
        VALID_PRIORITIES.has(s.priority),
    )
    .map((s: SuggestionItem) => ({
      analysisId: input.analysisId,
      title: s.title.slice(0, 500),
      description: s.description,
      recommendedFix: s.recommendedFix,
      priority: s.priority,
    }));

  if (validated.length === 0) {
    throw new Error("AI suggestions failed validation");
  }

  return insertSuggestions(validated);
}
