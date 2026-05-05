"use client";

import type { RefObject } from "react";
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
  Wifi,
  WifiOff,
  AlertCircle,
  Home as HomeIcon,
  Filter,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { Home } from "@/lib/api/services/homes";

interface DeviceFiltersProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  homeFilter: string;
  onHomeChange: (v: string) => void;
  homes: Home[];
  filterSectionRef?: RefObject<HTMLDivElement>;
}

export function DeviceFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  homeFilter,
  onHomeChange,
  homes,
  filterSectionRef,
}: DeviceFiltersProps) {
  const { t } = useTranslation();

  return (
    <div ref={filterSectionRef}>
      <Card className="transition-all duration-300">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchDevices") || "Search devices..."}
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
                <SelectItem value="ONLINE">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-green-500" />
                    {t("online")}
                  </div>
                </SelectItem>
                <SelectItem value="OFFLINE">
                  <div className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4 text-gray-500" />
                    {t("offline")}
                  </div>
                </SelectItem>
                <SelectItem value="ERROR">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    {t("error")}
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
