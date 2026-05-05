"use client";

import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Upload,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { OtaJobStatus } from "@/lib/api/services/ota";

const STATUS_CONFIG: Record<
  OtaJobStatus,
  {
    variant: "default" | "destructive" | "secondary" | "outline";
    icon: React.ReactNode;
  }
> = {
  APPLIED: {
    variant: "default",
    icon: <CheckCircle className="h-4 w-4 text-green-500" />,
  },
  FAILED: {
    variant: "destructive",
    icon: <XCircle className="h-4 w-4 text-red-500" />,
  },
  TIMEOUT: {
    variant: "destructive",
    icon: <XCircle className="h-4 w-4 text-red-500" />,
  },
  DOWNLOADING: {
    variant: "secondary",
    icon: <Download className="h-4 w-4 text-blue-500 animate-pulse" />,
  },
  SENT: {
    variant: "secondary",
    icon: <Upload className="h-4 w-4 text-blue-500" />,
  },
  PENDING: {
    variant: "outline",
    icon: <Clock className="h-4 w-4 text-yellow-500" />,
  },
};

const FALLBACK = {
  variant: "outline" as const,
  icon: <AlertCircle className="h-4 w-4 text-gray-500" />,
};

interface OtaJobStatusBadgeProps {
  status: OtaJobStatus;
}

export function OtaJobStatusBadge({ status }: OtaJobStatusBadgeProps) {
  const { t } = useTranslation();
  const cfg = STATUS_CONFIG[status] ?? FALLBACK;

  return (
    <Badge variant={cfg.variant} className="gap-1">
      {cfg.icon}
      {t(status.toLowerCase())}
    </Badge>
  );
}
