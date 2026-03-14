"use client";

import {
  ArrowRight,
  LayoutDashboard,
  Moon,
  Sparkles,
  Star,
  Sun,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { BrandLogo } from "@/components/shared/BrandLogo";
import { Button } from "@/components/ui/button";
import { Link as CustomLink } from "@/components/ui/link";

import { siteConfig } from "@/config/site";

import { useSession } from "@/lib/auth/client";
import { useThemeStore } from "@/lib/stores";

const AuthModal = dynamic(
  () => import("@/features/auth/components/AuthModal").then((m) => m.AuthModal),
  { ssr: false },
);

const FeedbackButton = dynamic(
  () =>
    import("@/components/shared/FeedbackButton").then((m) => m.FeedbackButton),
  { ssr: false },
);

const LandingBelowFold = dynamic(
  () =>
    import("@/components/landing/LandingBelowFold").then((m) => m.LandingBelowFold),
  { ssr: true },
);

const metrics = [
  { value: "73%", label: "Average score improvement" },
  { value: "2.4x", label: "More client inquiries" },
  { value: "10k+", label: "Profiles optimized" },
  { value: "4.9", label: "User rating", hasStar: true },
];

function AuthParamListener({
  isAuthenticated,
  isPending,
  onOpen,
}: {
  isAuthenticated: boolean;
  isPending: boolean;
  onOpen: (view: "login" | "signup") => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "login" || authParam === "signup") {
      if (!isAuthenticated && !isPending) {
        onOpen(authParam);
      }
    }
  }, [searchParams, isAuthenticated, isPending, onOpen]);

  return null;
}

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const { theme, setTheme } = useThemeStore();
  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session && !isPending;

  const openAuth = useCallback((view: "login" | "signup") => {
    setAuthView(view);
    setAuthOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Suspense>
        <AuthParamListener
          isAuthenticated={isAuthenticated}
          isPending={isPending}
          onOpen={openAuth}
        />
      </Suspense>

      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo size="md" withText />

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              {theme === "dark" ? (
                <Sun size={18} strokeWidth={1.5} />
              ) : (
                <Moon size={18} strokeWidth={1.5} />
              )}
            </Button>

            {isAuthenticated ? (
              <CustomLink href="/dashboard" size="sm" className="rounded-xl gap-2">
                <LayoutDashboard size={14} strokeWidth={1.5} />
                Get Started
              </CustomLink>
            ) : (<Button
              size="sm"
              className="rounded-xl"
              onClick={() => openAuth("signup")}
            >
              Get Started
            </Button>)}
          </div>
        </div>
      </nav>

      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-20" aria-label="Introduction">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-125 w-200 -translate-x-1/2 rounded-full bg-primary/6 blur-3xl" />
            <div className="absolute top-60 -left-20 h-75 w-75 rounded-full bg-secondary/8 blur-3xl" />
            <div className="absolute top-40 -right-20 h-75 w-75 rounded-full bg-primary/4 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-6xl px-6 text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
              <Sparkles size={14} className="text-primary" />
              AI-powered freelancer optimization
            </div>

            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Turn your profile into a{" "}
              <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                client magnet
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              GigScale analyzes your Upwork and Fiverr profiles, delivers
              actionable insights, and rewrites your content for maximum
              visibility and conversions.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              {isAuthenticated ? (
                <CustomLink href="/dashboard/analyze" size="lg" className="group rounded-2xl px-8 text-base">
                  Go to Dashboard
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </CustomLink>
              ) : (
                <Button
                  size="lg"
                  className="group rounded-2xl px-8 text-base"
                  onClick={() => openAuth("signup")}
                >
                  Start Free Analysis
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Button>
              )}
              <CustomLink href="#features" variant="outline" size="lg" className="rounded-2xl px-8 text-base">
                See How It Works
              </CustomLink>
            </div>

            {/* Metrics Bar */}
            <div className="mx-auto mt-20 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/40 bg-border/40 sm:grid-cols-4">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="bg-background px-6 py-5 text-center"
                >
                  <p className="text-2xl font-bold tracking-tight">
                    {m.value}{" "}
                    {m.hasStar && (
                      <Star size={14} className="inline text-chart-2" />
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LandingBelowFold
          isAuthenticated={isAuthenticated}
          openAuth={openAuth}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <BrandLogo size="sm" withText />
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <a href="/privacy" className="transition-colors hover:text-foreground">
                Privacy
              </a>
              <a href="/terms" className="transition-colors hover:text-foreground">
                Terms
              </a>
              <a href="/disclaimer" className="transition-colors hover:text-foreground">
                Disclaimer
              </a>
              <a href="/billing-policy" className="transition-colors hover:text-foreground">
                Billing &amp; Credits
              </a>
              <a href="/refund-policy" className="transition-colors hover:text-foreground">
                Refunds
              </a>
              <FeedbackButton />
              <span>
                &copy; {new Date().getFullYear()} {siteConfig.name}
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultView={authView}
      />
    </div>
  );
}
