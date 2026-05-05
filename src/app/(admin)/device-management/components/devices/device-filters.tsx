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

interface Home {
  id: number;
  homeName: string;
}

interface DeviceFiltersProps {
  searchRef: React.RefObject<HTMLDivElement>;
  filterRef: React.RefObject<HTMLDivElement>;
  searchText: string;
  statusFilter: string;
  homeFilter: string;
  homes: Home[];
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onHomeChange: (v: string) => void;
}

export function DeviceFilters({
  searchRef,
  filterRef,
  searchText,
  statusFilter,
  homeFilter,
  homes,
  onSearchChange,
  onStatusChange,
  onHomeChange,
}: DeviceFiltersProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Search */}
      <div ref={searchRef}>
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={`${t("search")} ${t("devices").toLowerCase()}...`}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div ref={filterRef}>
        <Card className="transition-all duration-300">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("status")}</label>
                <Select value={statusFilter} onValueChange={onStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allDevices")}</SelectItem>
                    <SelectItem value="true">{t("onlineDevices")}</SelectItem>
                    <SelectItem value="false">{t("offlineDevices")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("homeId")}</label>
                <Select value={homeFilter} onValueChange={onHomeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("filterByHome")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("allHomes")}</SelectItem>
                    {homes.map((home) => (
                      <SelectItem key={home.id} value={String(home.id)}>
                        {home.homeName} (#{home.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
