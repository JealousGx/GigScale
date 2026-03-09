"use client";

import { FeatureGate } from "@/components/shared/FeatureGate";
import { RewriteEditor } from "@/features/rewrite/components/RewriteEditor";
import { RewritePreview } from "@/features/rewrite/components/RewritePreview";
import { useRewrite } from "@/features/rewrite/hooks/useRewrite";
import type { RewriteMode, RewriteType } from "@/types";

const mockRewrite = {
  id: "r1",
  profileId: "p1",
  type: "headline" as const,
  mode: "seo_optimization" as const,
  originalText:
    "Full stack developer with experience in building web applications using React and Node.js",
  rewrittenText:
    "Senior Full-Stack Developer | React & Next.js Expert | Building Scalable SaaS Applications That Drive Revenue Growth",
  createdAt: new Date(),
};

export default function RewritePage() {
  const { generate, result, status, error, reset } = useRewrite();

  const handleGenerate = async (type: RewriteType, originalText: string, mode: RewriteMode) => {
    await generate("p1", type, originalText, mode);
  };

  const displayResult = result ?? (status === "complete" ? mockRewrite : null);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Rewrite Tool</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered rewrites to optimize your profile content for maximum impact
        </p>
      </div>

      <FeatureGate action="rewrite_generated">
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {displayResult ? (
          <RewritePreview rewrite={displayResult} onReset={reset} />
        ) : (
          <RewriteEditor onGenerate={handleGenerate} status={status} />
        )}
      </FeatureGate>
    </div>
  );
}
