"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Power, Sliders, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { channelsApi, Channel } from "@/lib/api/channels";
import { toast } from "sonner";

interface DeviceChannelsProps {
  deviceId: number;
}

export default function DeviceChannels({ deviceId }: DeviceChannelsProps) {
  const { t } = useTranslation();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChannels();
  }, [deviceId]);

  const loadChannels = async () => {
    setIsLoading(true);
    try {
      const data = await channelsApi.list(deviceId);
      setChannels(data);
    } catch (error: any) {
      toast.error(error.message || t("failedToLoadChannels"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (channel: Channel) => {
    try {
      await channelsApi.control(deviceId, channel.id, !channel.state);
      toast.success(t("channelUpdated"));
      loadChannels();
    } catch (error: any) {
      toast.error(error.message || t("failedToUpdateChannel"));
    }
  };

  const handleValueChange = async (channel: Channel, value: number) => {
    try {
      await channelsApi.control(deviceId, channel.id, undefined, value);
      // Update local state immediately for better UX
      setChannels((prev) =>
        prev.map((ch) => (ch.id === channel.id ? { ...ch, value } : ch)),
      );
    } catch (error: any) {
      toast.error(error.message || t("failedToUpdateChannel"));
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "RELAY":
        return "⚡";
      case "SENSOR":
        return "📊";
      case "DIMMER":
        return "💡";
      case "SERVO":
        return "🔧";
      case "RGB_LED":
        return "🌈";
      default:
        return "📡";
    }
  };

  const getChannelColor = (type: string) => {
    switch (type) {
      case "RELAY":
        return "bg-blue-500";
      case "SENSOR":
        return "bg-green-500";
      case "DIMMER":
        return "bg-yellow-500";
      case "SERVO":
        return "bg-purple-500";
      case "RGB_LED":
        return "bg-pink-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Sliders className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("noChannelsFound")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t("noChannelsDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <Card key={channel.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-10 w-10 rounded-lg ${getChannelColor(channel.type)} flex items-center justify-center text-2xl`}
                  >
                    {getChannelIcon(channel.type)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{channel.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {t("channel")} #{channel.channelNum}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{channel.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Relay/Digital Control */}
              {(channel.type === "RELAY" || channel.type === "DIGITAL_IN") && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {channel.state ? t("on") : t("off")}
                  </span>
                  <Switch
                    checked={channel.state}
                    onCheckedChange={() => handleToggle(channel)}
                    disabled={!channel.isEnabled}
                  />
                </div>
              )}

              {/* Dimmer/Servo Control */}
              {(channel.type === "DIMMER" || channel.type === "SERVO") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("value")}</span>
                    <span className="font-medium">
                      {channel.value || 0}
                      {channel.unit && ` ${channel.unit}`}
                    </span>
                  </div>
                  <Slider
                    value={[channel.value || 0]}
                    onValueChange={([value]) =>
                      handleValueChange(channel, value)
                    }
                    min={channel.minValue || 0}
                    max={channel.maxValue || 100}
                    step={1}
                    disabled={!channel.isEnabled}
                  />
                </div>
              )}

              {/* Sensor Display */}
              {channel.type === "SENSOR" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("reading")}
                    </span>
                    <span className="text-lg font-bold">
                      {channel.value?.toFixed(2) || "N/A"}
                      {channel.unit && ` ${channel.unit}`}
                    </span>
                  </div>
                  {channel.sensorType && (
                    <p className="text-xs text-muted-foreground">
                      {channel.sensorType}
                    </p>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>{channel.isEnabled ? t("enabled") : t("disabled")}</span>
                {channel.lastUpdated && (
                  <span>
                    {new Date(channel.lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
