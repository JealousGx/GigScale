"use client";

import { useState } from "react";
import { SuggestionsList } from "@/features/suggestions/components/SuggestionsList";
import { PRIORITY_CONFIG } from "@/features/suggestions/types/suggestionsTypes";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { Suggestion } from "@/types";

const mockSuggestions: Suggestion[] = [
  {
    id: "s1",
    analysisId: "a1",
    title: "Optimize your title with high-value keywords",
    description:
      "Your title is missing key search terms that clients use when looking for developers. Adding keywords like 'TypeScript', 'Next.js', and 'SaaS' will significantly boost visibility.",
    recommendedFix:
      "Change your title to: 'Senior Full-Stack Developer | React, Next.js, TypeScript | SaaS & Web App Specialist'",
    priority: "critical",
    isApplied: false,
    createdAt: new Date(),
  },
  {
    id: "s2",
    analysisId: "a1",
    title: "Add a clear call-to-action in your description",
    description:
      "Your profile description lacks a direct call-to-action. Profiles with a CTA see 23% more client inquiries on average.",
    recommendedFix:
      "Add a closing line like: 'Ready to bring your project to life? Send me a message and let\\'s discuss your goals.'",
    priority: "high",
    isApplied: false,
    createdAt: new Date(),
  },
  {
    id: "s3",
    analysisId: "a1",
    title: "Include quantifiable results and metrics",
    description:
      "Your profile mentions experience but lacks specific numbers. Adding metrics like '50+ projects completed' or '99% client satisfaction' builds instant credibility.",
    recommendedFix:
      "Add 2-3 concrete metrics near the top of your description: project count, satisfaction rate, revenue generated for clients, or response time.",
    priority: "high",
    isApplied: false,
    createdAt: new Date(),
  },
  {
    id: "s4",
    analysisId: "a1",
    title: "Expand your portfolio to 6+ items",
    description:
      "You currently have 4 portfolio items. Profiles with 6 or more samples receive significantly more views and are perceived as more established.",
    recommendedFix:
      "Add 2-3 more portfolio pieces showcasing different project types. Include case studies with brief problem-solution-result descriptions.",
    priority: "medium",
    isApplied: false,
    createdAt: new Date(),
  },
  {
    id: "s5",
    analysisId: "a1",
    title: "Improve tag relevance for better matching",
    description:
      "3 of your 5 tags are generic terms. Using more specific, niche-relevant tags helps the algorithm match you with the right clients.",
    recommendedFix:
      "Replace generic tags like 'web development' with specific ones: 'Next.js Development', 'React SPA', 'API Integration', 'TypeScript Expert'.",
    priority: "medium",
    isApplied: false,
    createdAt: new Date(),
  },
  {
    id: "s6",
    analysisId: "a1",
    title: "Update your profile image",
    description:
      "Your profile image appears to be a casual photo. Professional headshots increase trust score and client engagement by up to 14%.",
    recommendedFix:
      "Use a high-quality, professional headshot with good lighting and a neutral background. Ensure your face is clearly visible and you appear approachable.",
    priority: "low",
    isApplied: false,
    createdAt: new Date(),
  },
];

export default function SuggestionsPage() {
  const [suggestions] = useState<Suggestion[]>(mockSuggestions);
  const [isLoading] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Suggestions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-powered recommendations to improve your profile performance
          </p>
        </div>
        <Button className="rounded-2xl">
          <Sparkles size={16} />
          Regenerate
        </Button>
      </div>

      <div className="flex items-center gap-6 border-b border-border/30 pb-4">
        {(["critical", "high", "medium", "low"] as const).map((p) => (
          <div key={p} className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${PRIORITY_CONFIG[p].dotColor}`} />
            <span className="text-xs text-muted-foreground">
              {suggestions.filter((s) => s.priority === p).length} {PRIORITY_CONFIG[p].label}
            </span>
          </div>
        ))}
      </div>

      <SuggestionsList suggestions={suggestions} isLoading={isLoading} />
    </div>
  );
}
