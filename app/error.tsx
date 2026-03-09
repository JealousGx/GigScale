"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4">
      <BrandLogo size="lg" withText className="mb-12" />

      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-8 text-destructive" />
      </div>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        Something went wrong
      </h1>

      <p className="text-muted-foreground mt-2 max-w-md text-center text-sm">
        An unexpected error occurred. Please try again or return home.
      </p>

      {error.digest && (
        <p className="text-muted-foreground/60 mt-3 font-mono text-xs">
          Error ID: {error.digest}
        </p>
      )}

      <div className="mt-8 flex items-center gap-3">
        <Button variant="outline" onClick={reset}>
          <RotateCcw />
          Try again
        </Button>

        <Button asChild>
          <Link href="/">
            <Home />
            Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
