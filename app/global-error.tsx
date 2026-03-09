"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center bg-background px-4 text-foreground antialiased">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-8 text-destructive" />
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            An unexpected error occurred. Please try again or contact support if
            the problem persists.
          </p>

          {error.digest && (
            <p className="mt-3 font-mono text-xs text-muted-foreground/60">
              Error ID: {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            className="mt-8 inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
          >
            <RotateCcw className="size-4" />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
