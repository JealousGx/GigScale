"use client";

import { useState } from "react";
import { Gift, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCreditsStore } from "@/lib/stores";

import type { ScanStatus } from "../types/scanTypes";
import { detectPlatform } from "../utils/scanHelpers";

interface ScanInputProps {
  onScan: (url: string, platform: "upwork" | "fiverr") => void;
  status: ScanStatus;
}

export function ScanInput({ onScan, status }: ScanInputProps) {
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const freeScansRemaining = useCreditsStore((s) => s.freeScansRemaining);

  const handleScan = () => {
    const platform = detectPlatform(url);
    if (!platform) {
      setUrlError("Please enter a valid Upwork or Fiverr profile URL");
      return;
    }
    setUrlError(null);
    onScan(url, platform);
  };

  const isScanning = status === "scanning";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Analyze your profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste your Upwork or Fiverr profile URL to get a detailed analysis
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            strokeWidth={1.5}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setUrlError(null);
            }}
            placeholder="https://www.upwork.com/freelancers/~your-profile"
            className="h-12 w-full rounded-2xl border border-border/60 bg-muted/20 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/10"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
          />
        </div>
        <Button
          onClick={handleScan}
          disabled={isScanning || !url}
          size="lg"
          className="h-12 rounded-2xl px-8"
        >
          {isScanning ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Scanning...
            </>
          ) : (
            "Analyze"
          )}
        </Button>
      </div>

      {urlError && (
        <p className="text-sm text-destructive">{urlError}</p>
      )}

      <div className="flex items-center gap-6 pt-1">
        {freeScansRemaining > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Gift size={12} />
            First scan free — no credits needed
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block size-2 rounded-full bg-chart-1" />
          Upwork supported
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-block size-2 rounded-full bg-chart-1" />
          Fiverr supported
        </div>
      </div>
    </div>
  );
}
