"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Shield, Trash2, DoorOpen } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { RoomDTO } from "@/lib/api/dto/rooms.dto";
import { getPrivacyIcon, getPrivacyColor } from "../../lib/room-privacy";

interface RoomCardProps {
  room: RoomDTO;
  homeName: string;
  isDeleting: boolean;
  onAccessClick: (room: RoomDTO) => void;
  onDeleteClick: (room: RoomDTO) => void;
}

export function RoomCard({
  room,
  homeName,
  isDeleting,
  onAccessClick,
  onDeleteClick,
}: RoomCardProps) {
  const { t } = useTranslation();
  const privacy = room.privacyLevel ?? "PUBLIC";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
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
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Home */}
        <div className="flex items-center gap-2">
          <Home className="h-3 w-3 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">
            {homeName}
          </Badge>
        </div>

        {/* Privacy */}
        <div className="flex items-center gap-2">
          <Shield className="h-3 w-3 text-muted-foreground" />
          <Badge
            className={`flex items-center gap-1 text-xs ${getPrivacyColor(privacy)}`}
          >
            {getPrivacyIcon(privacy)}
            <span>{t(`privacy${privacy}` as any)}</span>
          </Badge>
        </div>

        {/* Created */}
        <div className="text-xs text-muted-foreground">
          {t("createdAt")}: {new Date(room.createdAt).toLocaleString()}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onAccessClick(room)}
          >
            <Shield className="h-3 w-3 mr-1" />
            {t("access")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteClick(room)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
