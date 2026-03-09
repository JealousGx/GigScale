export function getScoreColor(score: number): string {
  if (score >= 80) return "text-chart-1";
  if (score >= 60) return "text-chart-2";
  if (score >= 40) return "text-chart-3";
  return "text-destructive";
}

export function getScoreGradient(score: number): string {
  if (score >= 80) return "from-chart-1 to-chart-1/70";
  if (score >= 60) return "from-chart-2 to-chart-2/70";
  if (score >= 40) return "from-chart-3 to-chart-3/70";
  return "from-destructive to-destructive/70";
}

export function getScoreBg(score: number): string {
  if (score >= 80) return "bg-chart-1/10";
  if (score >= 60) return "bg-chart-2/10";
  if (score >= 40) return "bg-chart-3/10";
  return "bg-destructive/10";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

export function getScoreStroke(score: number): string {
  if (score >= 80) return "stroke-chart-1";
  if (score >= 60) return "stroke-chart-2";
  if (score >= 40) return "stroke-chart-3";
  return "stroke-destructive";
}

export function detectPlatform(url: string): "upwork" | "fiverr" | null {
  if (url.includes("upwork.com")) return "upwork";
  if (url.includes("fiverr.com")) return "fiverr";
  return null;
}
