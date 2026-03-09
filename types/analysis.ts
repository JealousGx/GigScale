export interface Analysis {
  id: string;
  profileId: string;
  profileScore: number;
  visibilityScore: number;
  conversionScore: number;
  trustScore: number;
  completenessScore: number;
  createdAt: Date;
}

export interface ScoreBreakdown {
  label: string;
  score: number;
  weight: number;
  description: string;
}

export interface VisibilityBreakdown {
  keywordCoverage: number;
  titleOptimization: number;
  tagOptimization: number;
  categoryRelevance: number;
}

export interface ConversionBreakdown {
  descriptionQuality: number;
  portfolioStrength: number;
  ctaPresence: number;
  proofElements: number;
}

export interface TrustBreakdown {
  reviewRating: number;
  reviewCountScore: number;
  profileAgeScore: number;
}

export interface CompletenessBreakdown {
  title: boolean;
  description: boolean;
  portfolio: boolean;
  profileImage: boolean;
  skills: boolean;
}
