"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Home as HomeIcon } from "lucide-react";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import { qk } from "@/lib/api/queries";

import {
  formatMAC,
  MAC_REGEX,
  type RegisterHome,
  type RegisterRoom,
  type CreatedDevice,
} from "../lib/register.types";
import { RegisterForm } from "./register-form";
import { CredentialsCard } from "./credentials-card";
import { TroubleshootingCard } from "./troubleshooting-card";

export function RegisterView() {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();

  // ── Form state ────────────────────────────────────────────
  const [macAddress, setMacAddress] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("SENSOR_NODE");
  const [selectedHome, setSelectedHome] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  // ── Result state ──────────────────────────────────────────
  const [createdDevice, setCreatedDevice] = useState<CreatedDevice | null>(
    null,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // ── Queries ───────────────────────────────────────────────
  const homesQuery = useQuery({
    queryKey: qk.homes.list(),
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: RegisterHome[] }>(
        "/api/v1/homes",
      );
      return res.data ?? [];
    },
  });

  const roomsQuery = useQuery({
    queryKey: ["rooms", selectedHome],
    queryFn: async () => {
      if (!selectedHome) return [];
      const res = await apiFetchBrowser<{ data: RegisterRoom[] }>(
        `/api/v1/homes/${selectedHome}/rooms`,
      );
      return res.data ?? [];
    },
    enabled: !!selectedHome,
  });

  // ── Handlers ──────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!MAC_REGEX.test(macAddress)) {
      toast({
        title: t("validationError"),
        description: t("invalidMacFormat"),
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const res = await apiFetchBrowser<{ data: CreatedDevice }>(
        `/api/v1/homes/${selectedHome}/devices`,
        {
          method: "POST",
          body: JSON.stringify({
            deviceName,
            deviceType,
            roomId: selectedRoom ? parseInt(selectedRoom) : null,
            mqttClientId: `ESP32_${macAddress.replace(/:/g, "")}`,
            capabilities: {
              mac: macAddress.toUpperCase(),
              firmware: "1.0.3",
              deviceType: "BASE",
              registeredVia: "admin-panel",
            },
          }),
        },
      );
      setCreatedDevice(res.data);
      toast({ title: t("success"), description: t("deviceRegistered") });
    } catch (err: any) {
      toast({
        title: t("error"),
        description: err.message || t("failedRegisterDevice"),
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSendCredentials() {
    if (!createdDevice) return;
    setIsSending(true);
    try {
      await apiFetchBrowser("/api/v1/devices/register/send-credentials", {
        method: "POST",
        body: JSON.stringify({
          mac: macAddress.toUpperCase(),
          deviceId: createdDevice.id,
          deviceKey: createdDevice.deviceKey,
        }),
      });
      toast({ title: t("success"), description: t("credentialsSent") });
      setTimeout(() => router.push("/device-management"), 2000);
    } catch (err: any) {
      toast({
        title: t("error"),
        description: err.message || t("failedSendCredentials"),
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  }

  function handleCopy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast({
      title: t("copied"),
      description: `${label} ${t("copiedToClipboard")}`,
    });
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
        <span className="text-foreground font-medium">
          {t("registerDevice")}
        </span>
      </div>

      {/* Instructions */}
      <Alert>
        <AlertTitle>{t("beforeStarting")}</AlertTitle>
        <AlertDescription className="text-sm">
          <ol className="list-decimal list-inside space-y-1 mt-1">
            <li>{t("uploadFirmwareInstruction")}</li>
            <li>{t("openSerialMonitorInstruction")}</li>
            <li>{t("noteMacAddressInstruction")}</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RegisterForm
          macAddress={macAddress}
          deviceName={deviceName}
          deviceType={deviceType}
          selectedHome={selectedHome}
          selectedRoom={selectedRoom}
          homes={homesQuery.data ?? []}
          rooms={roomsQuery.data ?? []}
          isSubmitting={isCreating}
          isDisabled={!!createdDevice}
          onMacChange={(v) => setMacAddress(formatMAC(v))}
          onNameChange={setDeviceName}
          onTypeChange={setDeviceType}
          onHomeChange={(v) => {
            setSelectedHome(v);
            setSelectedRoom("");
          }}
          onRoomChange={setSelectedRoom}
          onSubmit={handleCreate}
          onCopyMac={() => handleCopy(macAddress, t("macAddress"))}
        />

        <CredentialsCard
          device={createdDevice}
          macAddress={macAddress}
          isSending={isSending}
          onSend={handleSendCredentials}
          onCopy={handleCopy}
        />
      </div>

      <TroubleshootingCard />
    </div>
  );
}
