/**
 * Firmware DTOs
 */

export interface FirmwareReleaseDTO {
  id: number;
  platform: string;
  version: string;
  sha256: string;
  sizeBytes: number;
  filePath: string;
  notes?: string | null;
  createdAt: string;
}
