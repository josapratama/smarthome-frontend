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
import { Badge } from "@/components/ui/badge";
import { Home, Crown } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { Home as HomeType } from "@/lib/api/services/homes";

interface HomeSelectorProps {
  homes: HomeType[];
  selectedHomeId: string;
  onSelectHome: (homeId: string) => void;
  currentUserId: number;
}

export function HomeSelector({
  homes,
  selectedHomeId,
  onSelectHome,
  currentUserId,
}: HomeSelectorProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("selectHome")}</CardTitle>
        <CardDescription>{t("chooseHomeToManageMembers")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedHomeId} onValueChange={onSelectHome}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {homes.map((home) => (
              <SelectItem key={home.id} value={home.id.toString()}>
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  {home.name}
                  {home.ownerUserId === currentUserId && (
                    <Badge variant="outline" className="ml-2">
                      <Crown className="h-3 w-3 mr-1" />
                      {t("owner")}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
