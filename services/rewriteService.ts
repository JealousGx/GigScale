import { apiClient } from "./apiClient";
import type { Rewrite, RewriteMode, RewriteType } from "@/types";

interface RewritePayload {
  profileId: string;
  type: RewriteType;
  originalText: string;
  mode: RewriteMode;
}

export const rewriteService = {
  generate: (payload: RewritePayload) =>
    apiClient.post<Rewrite>("/rewrites/generate", payload),

  getHistory: (profileId: string) =>
    apiClient.get<Rewrite[]>(`/rewrites/${profileId}`),
};
