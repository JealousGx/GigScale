export const queryKeys = {
  profiles: {
    all: ["profiles"] as const,
    detail: (id: string) => ["profiles", id] as const,
  },
  analyses: {
    byProfile: (profileId: string) => ["analyses", profileId] as const,
    latest: ["analyses", "latest"] as const,
    history: ["analyses", "history"] as const,
  },
  suggestions: {
    byAnalysis: (analysisId: string) => ["suggestions", analysisId] as const,
  },
  rewrites: {
    byProfile: (profileId: string) => ["rewrites", profileId] as const,
  },
  credits: {
    all: ["credits"] as const,
  },
};
