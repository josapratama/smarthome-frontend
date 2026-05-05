"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/use-translation";
import { ACCESS_LEVEL_OPTIONS } from "../hooks/use-room-access";
import type { RoomAccessLevel } from "@/lib/api/services/room-access";

interface GrantAccessFormProps {
  availableUsers: any[];
  selectedUserId: number | null;
  onSelectUser: (id: number) => void;
  selectedAccessLevel: RoomAccessLevel;
  onSelectAccessLevel: (level: RoomAccessLevel) => void;
  expiresAt: string;
  onExpiresAtChange: (v: string) => void;
  isGranting: boolean;
  onGrant: () => void;
  onCancel: () => void;
}

export function GrantAccessForm({
  availableUsers,
  selectedUserId,
  onSelectUser,
  selectedAccessLevel,
  onSelectAccessLevel,
  expiresAt,
  onExpiresAtChange,
  isGranting,
  onGrant,
  onCancel,
}: GrantAccessFormProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
      <h4 className="font-medium">{t("grantAccess")}</h4>

      {/* User */}
      <div className="space-y-1.5">
        <Label>{t("selectUser")}</Label>
        <Select
          value={selectedUserId?.toString() ?? ""}
          onValueChange={(v) => onSelectUser(Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("selectUser")} />
          </SelectTrigger>
          <SelectContent>
            {availableUsers.map((member) => (
              <SelectItem key={member.userId} value={member.userId.toString()}>
                {member.user.username} ({member.user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Access level */}
      <div className="space-y-1.5">
        <Label>{t("selectAccessLevel")}</Label>
        <Select
          value={selectedAccessLevel}
          onValueChange={(v) => onSelectAccessLevel(v as RoomAccessLevel)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACCESS_LEVEL_OPTIONS.map((level) => (
              <SelectItem key={level} value={level}>
                {t(`access${level}` as any)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expiration */}
      <div className="space-y-1.5">
        <Label>{t("setExpiration")}</Label>
        <Input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => onExpiresAtChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">{t("noExpiration")}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={onGrant}
          disabled={isGranting || !selectedUserId}
        >
          {isGranting ? t("loading") : t("grantAccess")}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isGranting}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  );
}
