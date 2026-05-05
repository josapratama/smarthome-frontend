import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DoorOpen, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { RoomDTO } from "@/lib/api/dto/rooms.dto";

function fmtDateTime(v?: string | null): string {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

interface RoomItemCardProps {
  room: RoomDTO;
  homeId: number;
}

export function RoomItemCard({ room, homeId }: RoomItemCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <DoorOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {room.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">ID: #{room.id}</p>
            </div>
          </div>
          {room.deletedAt && (
            <Badge variant="destructive" className="text-xs">
              <Trash2 className="h-3 w-3 mr-1" />
              {t("deleted")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div>
            {t("created")}: {fmtDateTime(room.createdAt)}
          </div>
          {room.deletedAt && (
            <div className="text-red-600">
              {t("deleted")}: {fmtDateTime(room.deletedAt)}
            </div>
          )}
        </div>

        <Link
          href={`/device-management?homeId=${homeId}&roomId=${room.id}`}
          className="block pt-2 border-t"
        >
          <Button variant="outline" size="sm" className="w-full">
            {t("viewDevices")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
