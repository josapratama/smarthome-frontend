"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Activity, Search, Wifi, WifiOff } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

type StatusFilter = "all" | "online" | "offline";

interface MonitoringFiltersProps {
  searchRef: React.RefObject<HTMLDivElement>;
  filterRef: React.RefObject<HTMLDivElement>;
  searchQuery: string;
  statusFilter: StatusFilter;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: StatusFilter) => void;
}

export function MonitoringFilters({
  searchRef,
  filterRef,
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: MonitoringFiltersProps) {
  const { t } = useTranslation();

  const filters: {
    value: StatusFilter;
    label: string;
    icon: typeof Activity;
  }[] = [
    { value: "all", label: t("all"), icon: Activity },
    { value: "online", label: t("online"), icon: Wifi },
    { value: "offline", label: t("offline"), icon: WifiOff },
  ];

  return (
    <>
      <div ref={searchRef}>
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchDevices")}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div ref={filterRef}>
        <Card className="transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex gap-2">
              {filters.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => onStatusChange(value)}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${
                    statusFilter === value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-accent border-border"
                  }`}
                >
                  <Icon className="h-4 w-4 mx-auto mb-1" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
