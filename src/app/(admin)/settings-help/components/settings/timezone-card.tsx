"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

const TIMEZONES = [
  { value: "UTC", label: "UTC (GMT+0)" },
  { value: "Asia/Jakarta", label: "Asia/Jakarta (GMT+7)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (GMT+9)" },
  { value: "Europe/London", label: "Europe/London (GMT+0)" },
  { value: "America/New_York", label: "America/New York (GMT-5)" },
  { value: "America/Los_Angeles", label: "America/Los Angeles (GMT-8)" },
];

interface TimezoneCardProps {
  timezone: string;
  onChange: (tz: string) => void;
}

export function TimezoneCard({ timezone, onChange }: TimezoneCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          {t("timezone")}
        </CardTitle>
        <CardDescription className="text-sm">
          {t("selectYourTimezone")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={timezone} onValueChange={onChange}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
