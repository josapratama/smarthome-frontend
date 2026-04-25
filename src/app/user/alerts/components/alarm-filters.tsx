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
import {
  Search,
  Filter,
  Shield,
  Home as HomeIcon,
  AlertTriangle,
  AlertCircle,
  Bell,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { RefObject } from "react";

interface AlarmFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  severityFilter: string;
  onSeverityChange: (value: string) => void;
  homeFilter: string;
  onHomeChange: (value: string) => void;
  homes: { id: number; name: string }[];
  filterSectionRef?: RefObject<HTMLDivElement>;
}

export function AlarmFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  severityFilter,
  onSeverityChange,
  homeFilter,
  onHomeChange,
  homes,
  filterSectionRef,
}: AlarmFiltersProps) {
  const { t } = useTranslation();

  return (
    <div ref={filterSectionRef}>
      <Card className="transition-all duration-300">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchAlarms")}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder={t("status")} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="OPEN">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    {t("open")}
                  </div>
                </SelectItem>
                <SelectItem value="ACKED">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    {t("acknowledged")}
                  </div>
                </SelectItem>
                <SelectItem value="RESOLVED">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {t("resolved")}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={onSeverityChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder={t("severity")} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allSeverity")}</SelectItem>
                <SelectItem value="CRITICAL">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    {t("critical")}
                  </div>
                </SelectItem>
                <SelectItem value="HIGH">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    {t("high")}
                  </div>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-yellow-500" />
                    {t("medium")}
                  </div>
                </SelectItem>
                <SelectItem value="LOW">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-gray-500" />
                    {t("low")}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={homeFilter} onValueChange={onHomeChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <HomeIcon className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder={t("filterByHome")} />
                </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
