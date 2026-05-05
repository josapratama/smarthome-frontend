import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home as HomeIcon, Users, DoorOpen } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { HomeDTO } from "@/lib/api/dto/homes.dto";

function fmtDateTime(v?: string | null): string {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

interface HomeCardProps {
  home: HomeDTO;
}

export function HomeCard({ home }: HomeCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <HomeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              {home.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground">ID: #{home.id}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Address */}
        <div className="space-y-0.5">
          <p className="text-sm text-muted-foreground">
            {home.addressText || t("noAddress")}
          </p>
          {(home.city || home.postalCode) && (
            <p className="text-xs text-muted-foreground">
              {home.city}
              {home.city && home.postalCode && " • "}
              {home.postalCode}
            </p>
          )}
        </div>

        {/* Owner */}
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">
            {t("owner")}: {home.ownerUserId}
          </Badge>
        </div>

        {/* Timestamps */}
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div>
            {t("created")}: {fmtDateTime(home.createdAt)}
          </div>
          <div>
            {t("updated")}: {fmtDateTime(home.updatedAt)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Link
            href={`/location-management/homes/${home.id}/rooms`}
            className="flex-1"
          >
            <Button variant="outline" size="sm" className="w-full">
              <DoorOpen className="h-3 w-3 mr-1" />
              {t("rooms")}
            </Button>
          </Link>
          <Link
            href={`/device-management?homeId=${home.id}`}
            className="flex-1"
          >
            <Button variant="outline" size="sm" className="w-full">
              {t("devices")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
