"use client";

import { useState, useEffect } from "react";
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
    return <div className="p-4">{t("loading")}...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("deviceChannels")}</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t("addChannel")}
        </button>
      </div>

      {showAddForm && (
        <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{t("addNewChannel")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("channelNumber")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.channelNum}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    channelNum: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                min="1"
                max="16"
                placeholder="1-16"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("channelNumberDesc")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("channelName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder={t("channelNamePlaceholder")}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("channelNameDesc")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("channelType")} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as ChannelType,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                {CHANNEL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {t("channelTypeDesc")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("gpioPin")} ({t("optional")})
              </label>
              <input
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
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="e.g., 2, 4, 5"
              />
              <p className="text-xs text-gray-500 mt-1">{t("gpioPinDesc")}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCreate}
              disabled={!formData.name || !formData.channelNum}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {t("createChannel")}
            </button>
            <button
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
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {channels.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {t("noChannelsConfigured")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{t("noChannelsDesc")}</p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {t("addFirstChannel")}
              </button>
            </div>
          </div>
        ) : (
          channels.map((channel) => (
            <div
              key={channel.id}
              className="border rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
            >
              {editingChannel?.id === channel.id ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold mb-3">
                    {t("editChannel")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("name")}
                      </label>
                      <input
                        type="text"
                        defaultValue={channel.name}
                        id={`edit-name-${channel.id}`}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const name = (
                          document.getElementById(
                            `edit-name-${channel.id}`,
                          ) as HTMLInputElement
                        ).value;
                        handleUpdate(channel.id, { name });
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      {t("save")}
                    </button>
                    <button
                      onClick={() => setEditingChannel(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold">{channel.name}</h3>
                      <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full font-medium">
                        CH{channel.channelNum}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                        {channel.type}
                      </span>
                      {channel.pinNumber && (
                        <span className="px-2 py-1 text-xs bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full font-medium">
                          GPIO {channel.pinNumber}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span
                        className={`font-medium ${
                          channel.state
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-500"
                        }`}
                      >
                        {t("state")}: {channel.state ? t("on") : t("off")}
                      </span>
                      {channel.value !== null && (
                        <span className="text-gray-600 dark:text-gray-400">
                          {t("value")}: {channel.value}
                          {channel.unit || ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleToggleState(channel)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        channel.state
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-600 hover:bg-gray-700"
                      } text-white`}
                    >
                      {channel.state ? t("turnOff") : t("turnOn")}
                    </button>
                    <button
                      onClick={() => setEditingChannel(channel)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t("edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(channel.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      {t("delete")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
