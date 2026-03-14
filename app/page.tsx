"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  CircleCheck,
  Coins,
  Eye,
  LayoutDashboard,
  Lightbulb,
  Moon,
  PenLine,
  ShieldCheck,
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

import { plans } from "@/config/plans";
import { siteConfig } from "@/config/site";

import { useSession } from "@/lib/auth/client";
import { env } from "@/lib/env";
import { useThemeStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

const AuthModal = dynamic(
  () => import("@/features/auth/components/AuthModal").then((m) => m.AuthModal),
  { ssr: false },
);

const FeedbackButton = dynamic(
  () =>
    import("@/components/shared/FeedbackButton").then((m) => m.FeedbackButton),
  { ssr: false },
);

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  bgClass: string;
}

const features: Feature[] = [
  {
    icon: BarChart3,
    title: "Deep Profile Analysis",
    description:
      "Get a comprehensive breakdown of your profile across visibility, conversion, trust, and completeness metrics.",
    bgClass: "bg-primary",
  },
  {
    icon: Lightbulb,
    title: "AI-Powered Suggestions",
    description:
      "Receive prioritized, actionable recommendations tailored to your specific profile and niche.",
    bgClass: "bg-chart-2",
  },
  {
    icon: PenLine,
    title: "Smart Rewrite Engine",
    description:
      "Transform your headlines, descriptions, and gigs with AI-optimized copy that converts.",
    bgClass: "bg-secondary",
  },
  {
    icon: Eye,
    title: "Visibility Optimization",
    description:
      "Boost your search ranking with keyword analysis, tag optimization, and category alignment.",
    bgClass: "bg-chart-1",
  },
  {
    icon: ShieldCheck,
    title: "Trust Score Tracking",
    description:
      "Monitor and improve the signals that make clients confident in hiring you.",
    bgClass: "bg-chart-3",
  },
  {
    icon: Sparkles,
    title: "Multi-Platform Support",
    description:
      "Analyze and optimize profiles on both Upwork and Fiverr from a single dashboard.",
    bgClass: "bg-chart-4",
  },
];

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

        {/* Features */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to stand out
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                A complete toolkit for analyzing, optimizing, and rewriting your
                freelancer profile
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-3xl border border-border/40 bg-border/40 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group flex flex-col gap-4 bg-background p-8 transition-colors hover:bg-muted/10"
                  >
                    <div
                      className={cn(
                        "flex size-11 items-center justify-center rounded-xl text-white shadow-md",
                        feature.bgClass,
                      )}
                    >
                      <Icon size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">{feature.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-y border-border/30 bg-muted/10 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Three steps to a better profile
              </h2>
            </div>

            <div className="grid gap-12 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Paste your profile URL",
                  description:
                    "Drop your Upwork or Fiverr profile link and our AI engine begins a deep analysis.",
                },
                {
                  step: "02",
                  title: "Get your score breakdown",
                  description:
                    "See exactly where you stand across visibility, conversion, trust, and completeness.",
                },
                {
                  step: "03",
                  title: "Apply AI improvements",
                  description:
                    "Use prioritized suggestions and AI rewrites to transform your profile.",
                },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <span className="mb-4 inline-block bg-linear-to-r from-primary to-primary/50 bg-clip-text text-5xl font-bold tracking-tighter text-transparent">
                    {s.step}
                  </span>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mx-auto mt-4 max-w-md text-muted-foreground">
                Start free and upgrade when you need more power
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col rounded-3xl border p-8 transition-all duration-300",
                    plan.highlighted
                      ? "border-primary/30 bg-linear-to-b from-primary/3 to-transparent"
                      : "border-border/40 hover:border-border/60",
                  )}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    {plan.isContactSales ? (
                      <span className="text-4xl font-bold tracking-tight">
                        Custom
                      </span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold tracking-tight">
                          ${plan.price}
                        </span>
                        {/* <span className="text-sm text-muted-foreground">
                        /{plan.interval}
                      </span> */}
                      </>
                    )}
                  </div>
                  <div className="mb-6 mt-2 flex items-center gap-1.5 text-sm font-medium text-primary">
                    <Coins size={14} strokeWidth={1.5} />
                    {plan.isContactSales
                      ? "Custom credit allocation"
                      : `${plan.creditsPerMonth} credits`}
                  </div>
                  <div className="mb-8 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <CircleCheck
                          size={16}
                          strokeWidth={2}
                          className={cn(
                            "mt-0.5 shrink-0",
                            plan.highlighted
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                        <span className="text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                  {plan.isContactSales ? (
                    <CustomLink href={`mailto:${env.NEXT_PUBLIC_SALES_EMAIL}`} variant="outline" className="w-full rounded-2xl">
                      Contact Sales
                    </CustomLink>
                  ) : isAuthenticated ? (
                    <CustomLink
                      href="/dashboard/billing"
                      variant={plan.highlighted ? "default" : "outline"}
                      className="w-full rounded-2xl"
                    >
                      {`Choose ${plan.name}`}
                    </CustomLink>
                  ) : (
                    <Button
                      variant={plan.highlighted ? "default" : "outline"}
                      className="w-full rounded-2xl"
                      onClick={() => openAuth("signup")}
                    >
                      {plan.price === 0
                        ? "Get Started Free"
                        : `Choose ${plan.name}`}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/30 py-24">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to scale your freelancing?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Join thousands of freelancers who have optimized their profiles with
              GigScale
            </p>
            <div className="mt-8">
              {isAuthenticated ? (
                <CustomLink href="/dashboard" size="lg" className="group rounded-2xl px-10 text-base">
                  Go to Dashboard
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </CustomLink>
              ) : (
                <Button
                  size="lg"
                  className="group rounded-2xl px-10 text-base"
                  onClick={() => openAuth("signup")}
                >
                  Get Started — It&apos;s Free
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Button>
              )}
            </div>
          </div>
        </section>
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
