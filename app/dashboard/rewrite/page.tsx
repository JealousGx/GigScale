"use client";

import { AlertCircle, Loader2 } from "lucide-react";

import { FeatureGate } from "@/components/shared/FeatureGate";
import { Link } from "@/components/ui/link";

import { useProfiles } from "@/features/profile-scan/hooks/useProfiles";
import { RewriteEditor } from "@/features/rewrite/components/RewriteEditor";
import { RewritePreview } from "@/features/rewrite/components/RewritePreview";
import { useRewrite } from "@/features/rewrite/hooks/useRewrite";

import type { RewriteMode, RewriteType } from "@/types";

export default function RewritePage() {
  const { generate, result, status, error, reset } = useRewrite();
  const { data: profiles, isLoading: profilesLoading } = useProfiles();

  const latestProfile = profiles?.[0];

  const handleGenerate = async (type: RewriteType, originalText: string, mode: RewriteMode) => {
    if (!latestProfile) return;
    await generate(latestProfile.id, type, originalText, mode);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Rewrite Tool</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered rewrites to optimize your profile content for maximum impact
        </p>
      </div>

      <FeatureGate action="rewrite_generated">
        {profilesLoading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 size={20} className="animate-spin" />
          </div>
        )}

        {!profilesLoading && !latestProfile && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/40 bg-muted/5 py-16 text-center">
            <AlertCircle size={32} className="text-muted-foreground" />
            <div>
              <p className="font-medium">No profiles scanned yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Scan a profile first to use the rewrite tool
              </p>
            </div>
            <Link href="/dashboard/analyze" variant="default" className="mt-2 rounded-2xl">
              Analyze a Profile
            </Link>
          </div>
        )}

        {!profilesLoading && latestProfile && (
          <>
            <div className="rounded-xl bg-muted/20 px-4 py-2.5 text-sm text-muted-foreground">
              Using profile: <span className="font-medium text-foreground">{latestProfile.profileTitle}</span>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {result ? (
              <RewritePreview rewrite={result} onReset={reset} />
            ) : (
              <RewriteEditor onGenerate={handleGenerate} status={status} />
            )}
          </>
        )}
      </FeatureGate>
    </div>
  );
}
