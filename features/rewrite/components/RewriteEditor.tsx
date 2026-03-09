"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ModeSelector } from "./ModeSelector";
import { cn } from "@/lib/utils";
import type { RewriteMode, RewriteType } from "@/types";
import { REWRITE_TYPE_LABELS } from "@/types";
import type { RewriteStatus } from "../types/rewriteTypes";
import { Loader2, Sparkles } from "lucide-react";

interface RewriteEditorProps {
  onGenerate: (type: RewriteType, originalText: string, mode: RewriteMode) => void;
  status: RewriteStatus;
}

export function RewriteEditor({ onGenerate, status }: RewriteEditorProps) {
  const [type, setType] = useState<RewriteType>("headline");
  const [mode, setMode] = useState<RewriteMode>("seo_optimization");
  const [originalText, setOriginalText] = useState("");

  const types = Object.entries(REWRITE_TYPE_LABELS) as [RewriteType, string][];
  const isGenerating = status === "generating";

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-medium">What do you want to rewrite?</p>
        <div className="flex gap-2">
          {types.map(([t, label]) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                type === t
                  ? "bg-foreground text-background"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ModeSelector value={mode} onChange={setMode} />

      <div className="space-y-2">
        <Label htmlFor="original">Original Text</Label>
        <Textarea
          id="original"
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder={`Paste your current ${type} here...`}
          className="min-h-[160px] resize-none rounded-2xl border-border/40 bg-muted/10 transition-all focus:bg-background"
        />
        <p className="text-xs text-muted-foreground">
          {originalText.length} characters
        </p>
      </div>

      <Button
        onClick={() => onGenerate(type, originalText, mode)}
        disabled={isGenerating || !originalText.trim()}
        size="lg"
        className="rounded-2xl"
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate Rewrite
          </>
        )}
      </Button>
    </div>
  );
}
