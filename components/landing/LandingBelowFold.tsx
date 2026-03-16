"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  CircleCheck,
  Coins,
  Eye,
  Lightbulb,
  PenLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link as CustomLink } from "@/components/ui/link";

import { plans } from "@/config/plans";

import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

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

const faqs = [
  {
    question: "Which platforms does GigScale support?",
    answer:
      "GigScale currently supports freelancer profiles on Upwork and Fiverr. Support for additional marketplaces will be added over time.",
  },
  {
    question: "How deep is the profile analysis?",
    answer:
      "GigScale evaluates your profile across visibility, conversion, trust, and completeness signals, then breaks this down into a detailed scorecard with prioritized improvements.",
  },
  {
    question: "Will GigScale rewrite my profile for me?",
    answer:
      "Yes. In addition to the score breakdown and suggestions, GigScale generates AI-powered rewrites for your headlines, overviews, and key sections so you can apply improvements quickly.",
  },
  {
    question: "Is my data and profile content secure?",
    answer:
      "Your profile data is encrypted in transit and at rest. We only use it to analyze and generate suggestions for your account, and you can request deletion at any time.",
  },
  {
    question: "Do I need a credit card to get started?",
    answer:
      "No. You can run an initial profile analysis on the free plan and upgrade later if you need more credits or advanced features.",
  },
] as const;

interface LandingBelowFoldProps {
  isAuthenticated: boolean;
  openAuth: (view: "login" | "signup") => void;
}

export function LandingBelowFold({
  isAuthenticated,
  openAuth,
}: LandingBelowFoldProps) {
  return (
    <>
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

      {/* FAQ */}
      <section className="border-y border-border/30 bg-muted/5 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
              Answers to common questions about how GigScale analyzes and
              improves your freelancer profiles.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-border/40 bg-background/80 p-6 text-left"
              >
                <h3 className="text-sm font-semibold">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            }),
          }}
          type="application/ld+json"
        />
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
                    <span className="text-4xl font-bold tracking-tight">
                      ${plan.price}
                    </span>
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
                  <CustomLink
                    href={`mailto:${env.NEXT_PUBLIC_SALES_EMAIL}`}
                    variant="outline"
                    className="w-full rounded-2xl"
                  >
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
              <CustomLink
                href="/dashboard"
                size="lg"
                className="group rounded-2xl px-10 text-base"
              >
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
    </>
  );
}
