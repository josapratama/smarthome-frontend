"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Home as HomeIcon } from "lucide-react";

import { channelsApi, type Channel } from "@/lib/api/services/channels";
import type { CreateChannelDTO } from "@/lib/api/dto/channel.dto";

import { ChannelAddForm } from "./channel-add-form";
import { ChannelCard } from "./channel-card";
import { ChannelEmptyState } from "./channel-empty-state";

interface ChannelsViewProps {
  deviceId: number;
}

export function ChannelsView({ deviceId }: ChannelsViewProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const queryKey = ["channels", deviceId];

  // ── Fetch ─────────────────────────────────────────────────
  const { data: channels = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => channelsApi.list(deviceId),
    retry: false,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey });
  }

  // ── Create ────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateChannelDTO) =>
      channelsApi.create(data.deviceId, {
        channelNum: data.channelNum,
        name: data.name,
        type: data.type as any,
        pinNumber: data.pinNumber ?? undefined,
        pinMode: data.pinMode ?? undefined,
        sensorType: data.sensorType ?? undefined,
        unit: data.unit ?? undefined,
      }),
    onSuccess: () => {
      setShowAddForm(false);
      invalidate();
      toast({ title: t("success"), description: t("channelCreated") });
    },
    onError: (err: any) =>
      toast({
        title: t("error"),
        description: err.message || t("failedToCreateChannel"),
        variant: "destructive",
      }),
  });

  // ── Update ────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      channelsApi.update(deviceId, id, { name }),
    onSuccess: () => {
      setEditingId(null);
      invalidate();
      toast({ title: t("success"), description: t("channelUpdated") });
    },
    onError: (err: any) =>
      toast({
        title: t("error"),
        description: err.message || t("failedToUpdateChannel"),
        variant: "destructive",
      }),
  });

  // ── Delete ────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (channelId: number) => channelsApi.delete(deviceId, channelId),
    onSuccess: () => {
      invalidate();
      toast({ title: t("success"), description: t("channelDeleted") });
    },
    onError: (err: any) =>
      toast({
        title: t("error"),
        description: err.message || t("failedToDeleteChannel"),
        variant: "destructive",
      }),
  });

  // ── Toggle isEnabled ──────────────────────────────────────
  const enableMutation = useMutation({
    mutationFn: ({ id, isEnabled }: { id: number; isEnabled: boolean }) =>
      channelsApi.update(deviceId, id, { isEnabled }),
    onSuccess: (_, { isEnabled }) => {
      invalidate();
      toast({
        title: t("success"),
        description: isEnabled ? t("channelEnabled") : t("channelDisabled"),
      });
    },
    onError: (err: any) =>
      toast({
        title: t("error"),
        description: err.message || t("failedToUpdateChannel"),
        variant: "destructive",
      }),
  });

  // ── Toggle state ──────────────────────────────────────────
  async function handleToggle(channel: Channel) {
    setTogglingId(channel.id);
    try {
      await channelsApi.control(deviceId, channel.id, !channel.state);
      invalidate();
    } catch (err: any) {
      toast({
        title: t("error"),
        description: err.message || t("failedToToggleChannel"),
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  }

  // ── Delete with confirm ───────────────────────────────────
  function handleDelete(channelId: number) {
    if (!confirm(t("areYouSure"))) return;
    deleteMutation.mutate(channelId);
  }

  // ── Loading ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
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

      {/* Add form */}
      {showAddForm && (
        <ChannelAddForm
          deviceId={deviceId}
          nextChannelNum={channels.length + 1}
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
          }}
          onCancel={() => setShowAddForm(false)}
          isSubmitting={createMutation.isPending}
        />
      )}

      {/* Channel list */}
      <div className="grid gap-4">
        {channels.length === 0 ? (
          <ChannelEmptyState
            onAdd={() => setShowAddForm(true)}
            noChannelsLabel={t("noChannelsConfigured")}
            noChannelsDesc={t("noChannelsDesc")}
            addFirstLabel={t("addFirstChannel")}
          />
        ) : (
          channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              isEditing={editingId === channel.id}
              isTogglingId={togglingId}
              onToggle={handleToggle}
              onEditStart={(ch) => setEditingId(ch.id)}
              onEditSave={(id, name) => updateMutation.mutate({ id, name })}
              onEditCancel={() => setEditingId(null)}
              onDelete={handleDelete}
              onToggleEnabled={(id, isEnabled) =>
                enableMutation.mutate({ id, isEnabled })
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
