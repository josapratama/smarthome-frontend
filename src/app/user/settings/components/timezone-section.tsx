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
import { TIMEZONE_OPTIONS } from "../constants/languages";

interface TimezoneSectionProps {
  timezone: string | undefined;
  onTimezoneChange: (value: string) => void;
}

export function TimezoneSection({
  timezone,
  onTimezoneChange,
}: TimezoneSectionProps) {
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
        <Select value={timezone || "UTC"} onValueChange={onTimezoneChange}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
