import { profileService } from "@/services";
import type { ScanFormData, ScanResult } from "../types/scanTypes";

export const scanService = {
  scan: async (data: ScanFormData): Promise<ScanResult> => {
    return profileService.scan(data);
  },
};
