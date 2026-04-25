"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home as HomeIcon, Clock } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { Home } from "@/lib/api/services/homes";
import type { TimeRange } from "../hooks/use-energy";

interface EnergyFiltersProps {
  homes: Home[];
  selectedHome: string;
  onHomeChange: (v: string) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (v: TimeRange) => void;
}

export function EnergyFilters({
  homes,
  selectedHome,
  onHomeChange,
  timeRange,
  onTimeRangeChange,
}: EnergyFiltersProps) {
  const { t } = useTranslation();

  return (
    <Card data-filter-section className="transition-all duration-300">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <HomeIcon className="h-4 w-4 text-muted-foreground" />
              {t("filterByHome")}
            </label>
            <Select value={selectedHome} onValueChange={onHomeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allHomes")}</SelectItem>
                {homes.map((home) => (
                  <SelectItem key={home.id} value={home.id.toString()}>
                    <div className="flex items-center gap-2">
                      <HomeIcon className="h-4 w-4" />
                      {home.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {t("timeRange")}
            </label>
            <Select
              value={timeRange}
              onValueChange={(v) => onTimeRangeChange(v as TimeRange)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">{t("today")}</SelectItem>
                <SelectItem value="week">{t("thisWeek")}</SelectItem>
                <SelectItem value="month">{t("thisMonth")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
