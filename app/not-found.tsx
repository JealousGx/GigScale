import { ArrowLeft, Home } from "lucide-react";
import type { Metadata } from "next";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4">
      <BrandLogo size="lg" withText className="mb-12" />

      <p className="text-muted-foreground text-8xl font-bold tracking-tighter sm:text-9xl">
        404
      </p>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
        Page not found
      </h1>

      <p className="text-muted-foreground mt-2 max-w-md text-center text-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Button variant="outline" asChild>
          <Link href="javascript:history.back()" variant="outline">
            <ArrowLeft />
            Go back
          </Link>
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
