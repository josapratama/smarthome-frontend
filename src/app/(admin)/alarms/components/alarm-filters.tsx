"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { AlarmStatus } from "../types";

interface AlarmFiltersProps {
  filterRef: React.RefObject<HTMLDivElement>;
  searchText: string;
  statusFilter: AlarmStatus | "ALL";
  onSearchChange: (v: string) => void;
  onStatusChange: (v: AlarmStatus | "ALL") => void;
}

export function AlarmFilters({
  filterRef,
  searchText,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: AlarmFiltersProps) {
  const { t } = useTranslation();

  return (
    <div ref={filterRef}>
      <Card className="transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t("searchAlarms")}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => onStatusChange(v as AlarmStatus | "ALL")}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("allStatus")}</SelectItem>
                <SelectItem value="OPEN">{t("alarmStatusOpen")}</SelectItem>
                <SelectItem value="ACKED">{t("alarmStatusAcked")}</SelectItem>
                <SelectItem value="RESOLVED">
                  {t("alarmStatusResolved")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
