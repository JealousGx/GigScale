"use client";

import { Bug, Lightbulb, MessageSquare } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";

const BugReportDialog = dynamic(
  () => import("./BugReportDialog").then((m) => m.BugReportDialog),
  { ssr: false },
);

export function FeedbackButton() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bugDialogOpen, setBugDialogOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <React.Fragment>
      <div className="relative" ref={ref}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMenuOpen(!menuOpen)}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <MessageSquare size={14} />
          Feedback
        </Button>

        {menuOpen && (
          <div className="absolute bottom-full left-1/2 mb-2 w-56 -translate-x-1/2 rounded-xl border border-border/60 bg-background p-1.5 shadow-lg">
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60"
              onClick={() => {
                setMenuOpen(false);
                setBugDialogOpen(true);
              }}
              aria-label="Report a bug or describe an issue"
            >
              <Bug size={16} className="shrink-0 text-destructive" />
              <div>
                <p className="font-medium">Report a Bug</p>
                <p className="text-xs text-muted-foreground">Describe the issue</p>
              </div>
            </button>
            <a
              href={env.NEXT_PUBLIC_FEATUREBASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/60"
              onClick={() => setMenuOpen(false)}
            >
              <Lightbulb size={16} className="shrink-0 text-primary" />
              <div>
                <p className="font-medium">Suggest a Feature</p>
                <p className="text-xs text-muted-foreground">via Featurebase</p>
              </div>
            </a>
          </div>
        )}
      </div>

      {bugDialogOpen && (
        <BugReportDialog open={bugDialogOpen} onOpenChange={setBugDialogOpen} />
      )}
    </React.Fragment>
  );
}
