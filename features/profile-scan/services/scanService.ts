import { profileService } from "@/services";
import type {
  ScanFormData,
  ScanJobResponse,
  ScanJobStatusResponse,
} from "../types/scanTypes";

export const scanService = {
  scan: async (data: ScanFormData): Promise<ScanJobResponse> => {
    return profileService.scan(data);
  },

  getScanJob: async (jobId: string): Promise<ScanJobStatusResponse> => {
    return profileService.getScanJob(jobId);
  },
};
