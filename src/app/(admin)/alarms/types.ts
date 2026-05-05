import type {
  AlarmDTO,
  AlarmSeverity,
  AlarmStatus,
  AlarmSource,
} from "@/lib/api/dto/alarm.dto";

export type { AlarmDTO, AlarmSeverity, AlarmStatus, AlarmSource };

export interface AlarmStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  open: number;
  acked: number;
  resolved: number;
}
