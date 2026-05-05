"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { LucideIcon } from "lucide-react";

interface SensorToggleCardProps {
  label: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  enabled: boolean;
  enabledLabel: string;
  disabledLabel: string;
  onToggle: (val: boolean) => void;
}

export function SensorToggleCard({
  label,
  desc,
  icon: Icon,
  color,
  bg,
  enabled,
  enabledLabel,
  disabledLabel,
  onToggle,
}: SensorToggleCardProps) {
  return (
    <Card
      className={`rounded-2xl shadow-sm transition-all ${
        enabled ? "border-primary/30" : "opacity-70"
      }`}
    >
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-4">
          <div
            className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
          >
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">{label}</p>
              <Badge
                variant={enabled ? "default" : "secondary"}
                className="text-xs"
              >
                {enabled ? enabledLabel : disabledLabel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            className="flex-shrink-0"
          />
        </div>
      </CardContent>
    </Card>
  );
}
