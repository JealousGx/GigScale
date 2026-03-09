import type { RewriteMode, RewriteType } from "@/types";

export interface RewriteFormData {
  type: RewriteType;
  mode: RewriteMode;
  originalText: string;
}

export type RewriteStatus = "idle" | "generating" | "complete" | "error";
