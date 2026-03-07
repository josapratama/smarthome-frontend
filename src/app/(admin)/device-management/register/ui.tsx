"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Wifi, Loader2, Copy, Home as HomeIcon } from "lucide-react";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import { qk } from "@/lib/api/queries";
import { useToast } from "@/hooks/use-toast";

interface Home {
  id: number;
  name: string;
}

interface Room {
  id: number;
  name: string;
  homeId: number;
}

export default function DeviceRegistrationClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Form state
  const [macAddress, setMacAddress] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("SENSOR_NODE");
  const [selectedHome, setSelectedHome] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  // Result state
  const [createdDevice, setCreatedDevice] = useState<any>(null);
  const [sendingCredentials, setSendingCredentials] = useState(false);

  // Load homes
  const homesQuery = useQuery({
    queryKey: qk.homes.list(),
    queryFn: async () => {
      const response = await apiFetchBrowser<{ data: Home[] }>("/api/v1/homes");
      return response.data ?? [];
    },
  });

  // Load rooms when home selected
  const roomsQuery = useQuery({
    queryKey: ["rooms", selectedHome],
    queryFn: async () => {
      if (!selectedHome) return [];
      const response = await apiFetchBrowser<{ data: Room[] }>(
        `/api/v1/homes/${selectedHome}/rooms`,
      );
      return response.data ?? [];
    },
    enabled: !!selectedHome,
  });

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!macAddress || !deviceName || !selectedHome) {
      toast({
        title: t("validationError"),
        description: t("fillAllFields"),
        variant: "destructive",
      });
      return;
    }

    // Validate MAC format
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!macRegex.test(macAddress)) {
      toast({
        title: t("validationError"),
        description: "Format MAC address harus: AA:BB:CC:DD:EE:FF",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Use the correct endpoint: /api/v1/homes/{homeId}/devices
      const response = await apiFetchBrowser(
        `/api/v1/homes/${selectedHome}/devices`,
        {
          method: "POST",
          body: JSON.stringify({
            deviceName: deviceName,
            deviceType: deviceType,
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

      setCreatedDevice(response.data);

      toast({
        title: t("success"),
        description: t("deviceRegistered"),
      });
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("failedRegisterDevice"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendCredentials = async () => {
    if (!createdDevice) return;

    setSendingCredentials(true);
    try {
      await apiFetchBrowser("/api/v1/devices/register/send-credentials", {
        method: "POST",
        body: JSON.stringify({
          mac: macAddress.toUpperCase(),
          deviceId: createdDevice.id,
          deviceKey: createdDevice.deviceKey,
        }),
      });

      toast({
        title: t("success"),
        description: t("credentialsSent"),
      });

      // Redirect to devices list after 2 seconds
      setTimeout(() => {
        router.push("/device-management");
      }, 2000);
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("failedSendCredentials"),
        variant: "destructive",
      });
    } finally {
      setSendingCredentials(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t("copied"),
      description: `${label} ${t("copiedToClipboard")}`,
    });
  };

  const formatMAC = (value: string) => {
    // Remove all non-hex characters
    const cleaned = value.replace(/[^0-9A-Fa-f]/g, "");
    // Add colons every 2 characters
    const formatted = cleaned.match(/.{1,2}/g)?.join(":") || cleaned;
    return formatted.toUpperCase().substring(0, 17); // Max length AA:BB:CC:DD:EE:FF
  };

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

      {/* Instructions Alert */}
      <Alert>
        <AlertTitle>{t("beforeStarting")}</AlertTitle>
        <AlertDescription className="text-sm space-y-1">
          <ol className="list-decimal list-inside space-y-1">
            <li>{t("uploadFirmwareInstruction")}</li>
            <li>{t("openSerialMonitorInstruction")}</li>
            <li>{t("noteMacAddressInstruction")}</li>
          </ol>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Step 1 & 2: Device Info and Create */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>{t("deviceInformation")}</CardTitle>
            <CardDescription>
              {t("enterDeviceDetailsAndCreate")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDevice} className="space-y-4">
              {/* MAC Address */}
              <div className="space-y-2">
                <Label htmlFor="mac">
                  {t("macAddress")} <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="mac"
                    placeholder="AA:BB:CC:DD:EE:FF"
                    value={macAddress}
                    onChange={(e) => setMacAddress(formatMAC(e.target.value))}
                    className="font-mono"
                    disabled={!!createdDevice}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(macAddress, t("macAddress"))}
                    disabled={!macAddress}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("fromSerialMonitor")}
                </p>
              </div>

              <Separator />

              {/* Device Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t("deviceName")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Sensor Api Dapur"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  disabled={!!createdDevice}
                />
              </div>

              {/* Device Type */}
              <div className="space-y-2">
                <Label htmlFor="type">{t("deviceType")}</Label>
                <Select
                  value={deviceType}
                  onValueChange={setDeviceType}
                  disabled={!!createdDevice}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SENSOR_NODE">
                      {t("sensorNode")}
                    </SelectItem>
                    <SelectItem value="LIGHT">{t("light")}</SelectItem>
                    <SelectItem value="FAN">{t("fan")}</SelectItem>
                    <SelectItem value="DOOR">{t("door")}</SelectItem>
                    <SelectItem value="POWER_METER">
                      {t("powerMeter")}
                    </SelectItem>
                    <SelectItem value="OTHER">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Home */}
              <div className="space-y-2">
                <Label htmlFor="home">
                  {t("home")} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedHome}
                  onValueChange={setSelectedHome}
                  disabled={!!createdDevice}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectHome")} />
                  </SelectTrigger>
                  <SelectContent>
                    {homesQuery.data?.map((home) => (
                      <SelectItem key={home.id} value={home.id.toString()}>
                        {home.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Room */}
              <div className="space-y-2">
                <Label htmlFor="room">
                  {t("room")} ({t("optional")})
                </Label>
                <Select
                  value={selectedRoom}
                  onValueChange={setSelectedRoom}
                  disabled={!!createdDevice || !selectedHome}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectRoom")} />
                  </SelectTrigger>
                  <SelectContent>
                    {roomsQuery.data?.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!createdDevice && (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    loading || !macAddress || !deviceName || !selectedHome
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("creating")}
                    </>
                  ) : (
                    t("createDevice")
                  )}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Step 3: Send Credentials */}
        <Card
          className={`rounded-2xl shadow-sm ${createdDevice ? "border-green-500" : ""}`}
        >
          <CardHeader>
            <CardTitle>{t("sendCredentials")}</CardTitle>
            <CardDescription>
              {createdDevice
                ? t("deviceCreatedSendCredentials")
                : t("createDeviceFirstToSendCredentials")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!createdDevice ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wifi className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  {t("fillFormAndCreateDevice")}
                </p>
              </div>
            ) : (
              <>
                {/* Device Credentials */}
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {t("deviceId")}:
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="font-mono">
                        {createdDevice.id}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            createdDevice.id.toString(),
                            t("deviceId"),
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {t("deviceKey")}:
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        {createdDevice.deviceKey.substring(0, 20)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            createdDevice.deviceKey,
                            t("deviceKey"),
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{t("name")}:</span>
                    <span className="text-sm">{createdDevice.deviceName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">MAC:</span>
                    <span className="text-sm font-mono">
                      {createdDevice.capabilities?.mac || macAddress}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{t("type")}:</span>
                    <Badge variant="outline">{createdDevice.deviceType}</Badge>
                  </div>
                </div>

                {/* Send Button */}
                <Alert>
                  <AlertDescription className="text-sm">
                    {t("clickToSendCredentials")}
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleSendCredentials}
                  disabled={sendingCredentials}
                  size="lg"
                  className="w-full"
                >
                  {sendingCredentials ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("sending")}
                    </>
                  ) : (
                    t("sendCredentialsToDevice")
                  )}
                </Button>

                {/* What happens next */}
                <Alert>
                  <AlertTitle className="text-sm">
                    {t("whatHappensNext")}:
                  </AlertTitle>
                  <AlertDescription className="text-xs space-y-1">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>
                        {t("credentialsSentViaMqtt")}:{" "}
                        <code>
                          devices/register/{macAddress.replace(/:/g, "")}
                        </code>
                      </li>
                      <li>{t("esp32ReceivesAndSaves")}</li>
                      <li>{t("esp32RestartsAutomatically")}</li>
                      <li>{t("deviceConnectsAndAppearsOnline")}</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Troubleshooting */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("troubleshooting")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <h4 className="font-medium mb-2">
                {t("deviceNotReceivingCredentials")}
              </h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>{t("checkMqttBrokerRunning")}</li>
                <li>{t("checkEsp32StillOnline")}</li>
                <li>{t("verifyMacAddressCorrect")}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">
                {t("deviceNotAppearingOnline")}
              </h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>{t("checkWifiCredentialsInFirmware")}</li>
                <li>{t("checkMqttServerIpCorrect")}</li>
                <li>{t("wait30SecondsForHeartbeat")}</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">
                {t("macAddressAlreadyExists")}
              </h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>{t("deviceAlreadyRegistered")}</li>
                <li>{t("checkDeviceList")}</li>
                <li>{t("deleteOldDeviceIfNeeded")}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
