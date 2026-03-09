export type Platform = "upwork" | "fiverr";

export interface Profile {
  id: string;
  userId: string;
  platform: Platform;
  profileUrl: string;
  profileTitle: string;
  profileDescription: string;
  reviewRating: number;
  reviewCount: number;
  portfolioCount: number;
  profileAgeYears: number;
  lastScannedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
