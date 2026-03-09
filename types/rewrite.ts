export type RewriteType = "headline" | "description" | "gig";

export type RewriteMode =
  | "seo_optimization"
  | "conversion_optimization"
  | "premium_client_targeting"
  | "clarity_improvement";

export interface Rewrite {
  id: string;
  profileId: string;
  type: RewriteType;
  mode: RewriteMode;
  originalText: string;
  rewrittenText: string;
  createdAt: Date;
}

export const REWRITE_MODE_LABELS: Record<RewriteMode, string> = {
  seo_optimization: "SEO Optimization",
  conversion_optimization: "Conversion Optimization",
  premium_client_targeting: "Premium Client Targeting",
  clarity_improvement: "Clarity Improvement",
};

export const REWRITE_TYPE_LABELS: Record<RewriteType, string> = {
  headline: "Headline",
  description: "Description",
  gig: "Gig",
};
