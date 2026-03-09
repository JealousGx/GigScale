"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" />
      </div>

      <h2 className="mt-5 text-xl font-semibold tracking-tight">
        Something went wrong
      </h2>

      <p className="text-muted-foreground mt-2 max-w-sm text-center text-sm">
        An error occurred while loading this page. Please try again.
      </p>

      {error.digest && (
        <p className="text-muted-foreground/60 mt-3 font-mono text-xs">
          Error ID: {error.digest}
        </p>
      )}

      <Button variant="outline" onClick={reset} className="mt-6">
        <RotateCcw />
        Try again
      </Button>
    </div>
  );
}
