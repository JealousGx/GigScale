"use client";

import type { Rewrite } from "@/types";
import { Button } from "@/components/ui/button";
import { Copy, CircleCheck } from "lucide-react";
import { useState } from "react";

interface RewritePreviewProps {
  rewrite: Rewrite;
  onReset: () => void;
}

export function RewritePreview({ rewrite, onReset }: RewritePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rewrite.rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Rewritten {rewrite.type}
          </h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={handleCopy}>
            {copied ? <CircleCheck size={14} strokeWidth={1.5} /> : <Copy size={14} strokeWidth={1.5} />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="ghost" size="sm" className="rounded-xl" onClick={onReset}>
            New rewrite
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Original
          </p>
          <div className="rounded-2xl border border-border/30 bg-muted/10 p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {rewrite.originalText}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Rewritten
          </p>
          <div className="rounded-2xl border border-primary/20 bg-primary/2 p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {rewrite.rewrittenText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
