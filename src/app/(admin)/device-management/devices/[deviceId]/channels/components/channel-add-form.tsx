"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import type { CreateChannelDTO, ChannelType } from "@/lib/api/dto/channel.dto";
import { CHANNEL_TYPES } from "../lib/channel-constants";

interface ChannelAddFormProps {
  deviceId: number;
  nextChannelNum: number;
  onSubmit: (data: CreateChannelDTO) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ChannelAddForm({
  deviceId,
  nextChannelNum,
  onSubmit,
  onCancel,
  isSubmitting,
}: ChannelAddFormProps) {
  const { t } = useTranslation();

  const [form, setForm] = useState<CreateChannelDTO>({
    deviceId,
    channelNum: nextChannelNum,
    name: "",
    type: "RELAY",
    pinNumber: undefined,
  });

  function update<K extends keyof CreateChannelDTO>(
    key: K,
    value: CreateChannelDTO[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isValid = !!form.name.trim() && !!form.channelNum;

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>{t("addNewChannel")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Channel number */}
          <div className="space-y-2">
            <Label htmlFor="channelNum">
              {t("channelNumber")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="channelNum"
              type="number"
              value={form.channelNum}
              onChange={(e) => update("channelNum", parseInt(e.target.value))}
              min="1"
              max="32"
              placeholder="1-32"
            />
            <p className="text-xs text-muted-foreground">
              {t("channelNumberDesc")}
            </p>
          </div>

          {/* Channel name */}
          <div className="space-y-2">
            <Label htmlFor="channelName">
              {t("channelName")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="channelName"
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder={t("channelNamePlaceholder")}
            />
            <p className="text-xs text-muted-foreground">
              {t("channelNameDesc")}
            </p>
          </div>

          {/* Channel type */}
          <div className="space-y-2">
            <Label htmlFor="channelType">
              {t("channelType")} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.type}
              onValueChange={(v) => update("type", v as ChannelType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("channelTypeDesc")}
            </p>
          </div>

          {/* GPIO pin */}
          <div className="space-y-2">
            <Label htmlFor="gpioPin">
              {t("gpioPin")} ({t("optional")})
            </Label>
            <Input
              id="gpioPin"
              type="number"
              value={form.pinNumber ?? ""}
              onChange={(e) =>
                update(
                  "pinNumber",
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
              placeholder="e.g., 2, 4, 5"
            />
            <p className="text-xs text-muted-foreground">{t("gpioPinDesc")}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => onSubmit(form)}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? t("saving") : t("createChannel")}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t("cancel")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
