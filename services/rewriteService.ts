import { apiClient } from "./apiClient";
import type { Rewrite, RewriteMode, RewriteType } from "@/types";

interface RewritePayload {
  profileId: string;
  type: RewriteType;
  originalText: string;
  mode: RewriteMode;
}

export interface RewritesPageResponse {
  items: Rewrite[];
  hasMore: boolean;
  nextCursor: string | null;
  pageSize: number;
}

export const rewriteService = {
  generate: (payload: RewritePayload) =>
    apiClient.post<Rewrite>("/rewrites/generate", payload),

  getHistory: (
    profileId: string,
    options?: { cursor?: string; pageSize?: number },
  ) => {
    const searchParams = new URLSearchParams();
    if (options?.cursor) searchParams.set("cursor", options.cursor);
    if (options?.pageSize) searchParams.set("pageSize", String(options.pageSize));
    const query = searchParams.toString();
    return apiClient.get<RewritesPageResponse>(
      `/rewrites/${profileId}${query ? `?${query}` : ""}`,
    );
  },
};
