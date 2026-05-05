"use client";

import { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Power, Pencil, Trash2, EyeOff, Eye } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { Channel } from "@/lib/api/services/channels";

interface ChannelCardProps {
  channel: Channel;
  isEditing: boolean;
  isTogglingId: number | null;
  onToggle: (channel: Channel) => void;
  onEditStart: (channel: Channel) => void;
  onEditSave: (channelId: number, name: string) => void;
  onEditCancel: () => void;
  onDelete: (channelId: number) => void;
  onToggleEnabled: (channelId: number, isEnabled: boolean) => void;
}

export function ChannelCard({
  channel,
  isEditing,
  isTogglingId,
  onToggle,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
  onToggleEnabled,
}: ChannelCardProps) {
  const { t } = useTranslation();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const isToggling = isTogglingId === channel.id;
  const isDisabled = !channel.isEnabled;

  if (isEditing) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">{t("editChannel")}</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`edit-name-${channel.id}`}>{t("name")}</Label>
              <Input
                ref={nameInputRef}
                id={`edit-name-${channel.id}`}
                defaultValue={channel.name}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  onEditSave(
                    channel.id,
                    nameInputRef.current?.value ?? channel.name,
                  )
                }
              >
                {t("save")}
              </Button>
              <Button variant="outline" onClick={onEditCancel}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`rounded-2xl shadow-sm transition-all ${
        isDisabled ? "opacity-60 border-dashed" : "hover:shadow-md"
      }`}
    >
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <h3
                className={`text-lg font-semibold ${
                  isDisabled ? "text-muted-foreground line-through" : ""
                }`}
              >
                {channel.name}
              </h3>
              <Badge variant="secondary">CH{channel.channelNum}</Badge>
              <Badge variant="outline">{channel.type}</Badge>
              {channel.pinNumber != null && (
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  GPIO {channel.pinNumber}
                </Badge>
              )}
              {/* Disabled badge */}
              {isDisabled && (
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-400 dark:text-orange-400"
                >
                  <EyeOff className="h-3 w-3 mr-1" />
                  {t("channelDisabledBadge")}
                </Badge>
              )}
            </div>

            {!isDisabled && (
              <div className="flex items-center gap-4 text-sm">
                <span
                  className={`font-medium ${
                    channel.state
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {t("state")}: {channel.state ? t("on") : t("off")}
                </span>
                {channel.value != null && (
                  <span className="text-muted-foreground">
                    {t("value")}: {channel.value}
                    {channel.unit ?? ""}
                  </span>
                )}
              </div>
            )}

            {isDisabled && (
              <p className="text-xs text-muted-foreground">
                {t("channelDisabledDesc")}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {/* Toggle ON/OFF — hanya untuk channel yang bisa dikontrol, bukan SENSOR */}
            {!isDisabled &&
              ["RELAY", "DIMMER", "RGB_LED", "SERVO"].includes(
                channel.type,
              ) && (
                <Button
                  onClick={() => onToggle(channel)}
                  variant={channel.state ? "default" : "secondary"}
                  size="sm"
                  disabled={isToggling}
                >
                  <Power className="mr-2 h-4 w-4" />
                  {isToggling
                    ? t("loading")
                    : channel.state
                      ? t("turnOff")
                      : t("turnOn")}
                </Button>
              )}

            {/* Enable / Disable toggle — hanya untuk RELAY/DIMMER/RGB_LED, bukan SENSOR */}
            {[
              "RELAY",
              "DIMMER",
              "RGB_LED",
              "SERVO",
              "ANALOG_IN",
              "DIGITAL_IN",
            ].includes(channel.type) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleEnabled(channel.id, !channel.isEnabled)}
                className={
                  isDisabled
                    ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950 border-green-300"
                    : "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950 border-orange-300"
                }
              >
                {isDisabled ? (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    {t("enableChannel")}
                  </>
                ) : (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    {t("disableChannel")}
                  </>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStart(channel)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {t("edit")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => onDelete(channel.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("delete")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
