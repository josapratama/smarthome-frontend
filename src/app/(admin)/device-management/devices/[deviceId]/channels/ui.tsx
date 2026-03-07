"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getDeviceChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  setChannelState,
} from "@/lib/api/channels";
import type {
  ChannelDTO,
  CreateChannelDTO,
  UpdateChannelDTO,
  ChannelType,
} from "@/lib/api/dto/channel.dto";
import { useTranslation } from "@/hooks/use-translation";
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
import { Badge } from "@/components/ui/badge";
import { Home as HomeIcon, Plus, Pencil, Trash2, Power } from "lucide-react";

const CHANNEL_TYPES: ChannelType[] = [
  "RELAY",
  "DIMMER",
  "LED",
  "SENSOR",
  "SWITCH",
  "FAN",
  "MOTOR",
  "SERVO",
  "OTHER",
];

export function ChannelsUI({ deviceId }: { deviceId: number }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [channels, setChannels] = useState<ChannelDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ChannelDTO | null>(null);

  const [formData, setFormData] = useState<CreateChannelDTO>({
    deviceId,
    channelNum: 1,
    name: "",
    type: "RELAY",
    pinNumber: undefined,
  });

  useEffect(() => {
    loadChannels();
  }, [deviceId]);

  async function loadChannels() {
    try {
      setLoading(true);
      const data = await getDeviceChannels(deviceId);
      setChannels(data);
    } catch (error) {
      console.error("Failed to load channels:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      await createChannel(formData);
      setShowAddForm(false);
      setFormData({
        deviceId,
        channelNum: channels.length + 1,
        name: "",
        type: "RELAY",
        pinNumber: undefined,
      });
      loadChannels();
    } catch (error) {
      console.error("Failed to create channel:", error);
      alert("Failed to create channel");
    }
  }

  async function handleUpdate(channelId: number, data: UpdateChannelDTO) {
    try {
      await updateChannel(channelId, data);
      setEditingChannel(null);
      loadChannels();
    } catch (error) {
      console.error("Failed to update channel:", error);
      alert("Failed to update channel");
    }
  }

  async function handleDelete(channelId: number) {
    if (!confirm(t("areYouSure"))) return;

    try {
      await deleteChannel(channelId);
      loadChannels();
    } catch (error) {
      console.error("Failed to delete channel:", error);
      alert(t("error"));
    }
  }

  async function handleToggleState(channel: ChannelDTO) {
    try {
      await setChannelState(channel.id, { state: !channel.state });
      loadChannels();
    } catch (error) {
      console.error("Failed to toggle channel state:", error);
      alert("Failed to toggle channel state");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("loading")}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => router.push("/device-management")}
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <HomeIcon className="h-4 w-4" />
          {t("deviceManagement")}
        </button>
        <span>/</span>
        <button
          onClick={() => router.push(`/device-management/devices/${deviceId}`)}
          className="hover:text-foreground transition-colors"
        >
          {t("device")} #{deviceId}
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">
          {t("manageChannels")}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("deviceChannels")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("manageDeviceChannels")}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          {t("addChannel")}
        </Button>
      </div>

      {showAddForm && (
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>{t("addNewChannel")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="channelNum">
                  {t("channelNumber")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="channelNum"
                  type="number"
                  value={formData.channelNum}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      channelNum: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max="16"
                  placeholder="1-16"
                />
                <p className="text-xs text-muted-foreground">
                  {t("channelNumberDesc")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="channelName">
                  {t("channelName")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="channelName"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t("channelNamePlaceholder")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("channelNameDesc")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="channelType">
                  {t("channelType")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value as ChannelType,
                    })
                  }
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

              <div className="space-y-2">
                <Label htmlFor="gpioPin">
                  {t("gpioPin")} ({t("optional")})
                </Label>
                <Input
                  id="gpioPin"
                  type="number"
                  value={formData.pinNumber || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pinNumber: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="e.g., 2, 4, 5"
                />
                <p className="text-xs text-muted-foreground">
                  {t("gpioPinDesc")}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreate}
                disabled={!formData.name || !formData.channelNum}
              >
                {t("createChannel")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    deviceId,
                    channelNum: channels.length + 1,
                    name: "",
                    type: "RELAY",
                    pinNumber: undefined,
                  });
                }}
              >
                {t("cancel")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {channels.length === 0 ? (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Power className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t("noChannelsConfigured")}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {t("noChannelsDesc")}
                </p>
                <Button onClick={() => setShowAddForm(true)} size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("addFirstChannel")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          channels.map((channel) => (
            <Card
              key={channel.id}
              className="rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              {editingChannel?.id === channel.id ? (
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {t("editChannel")}
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-name-${channel.id}`}>
                        {t("name")}
                      </Label>
                      <Input
                        type="text"
                        defaultValue={channel.name}
                        id={`edit-name-${channel.id}`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          const name = (
                            document.getElementById(
                              `edit-name-${channel.id}`,
                            ) as HTMLInputElement
                          ).value;
                          handleUpdate(channel.id, { name });
                        }}
                      >
                        {t("save")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingChannel(null)}
                      >
                        {t("cancel")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <h3 className="text-lg font-semibold">
                          {channel.name}
                        </h3>
                        <Badge variant="secondary">
                          CH{channel.channelNum}
                        </Badge>
                        <Badge variant="outline">{channel.type}</Badge>
                        {channel.pinNumber && (
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            GPIO {channel.pinNumber}
                          </Badge>
                        )}
                      </div>
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
                        {channel.value !== null && (
                          <span className="text-muted-foreground">
                            {t("value")}: {channel.value}
                            {channel.unit || ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        onClick={() => handleToggleState(channel)}
                        variant={channel.state ? "default" : "secondary"}
                        size="sm"
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {channel.state ? t("turnOff") : t("turnOn")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingChannel(channel)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        {t("edit")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => handleDelete(channel.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("delete")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
