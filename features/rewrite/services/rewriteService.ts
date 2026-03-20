import { rewriteService as apiRewrite } from "@/services";
import type { RewritesPageResponse } from "@/services/rewriteService";
import type { Rewrite, RewriteMode, RewriteType } from "@/types";

export const featureRewriteService = {
  generate: async (
    profileId: string,
    type: RewriteType,
    originalText: string,
    mode: RewriteMode,
  ): Promise<Rewrite> => {
    return apiRewrite.generate({ profileId, type, originalText, mode });
  },
  getHistory: async (
    profileId: string,
    options?: { cursor?: string; pageSize?: number },
  ): Promise<RewritesPageResponse> => {
    return apiRewrite.getHistory(profileId, options);
  },
};
