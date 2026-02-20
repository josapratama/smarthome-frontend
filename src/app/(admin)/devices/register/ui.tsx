"use client";

import { useState, useEffect } from "react";
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
import {
  Wifi,
  Send,
  CheckCircle2,
  Loader2,
  Copy,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
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
        title: "Invalid MAC Address",
        description: "MAC address must be in format: AA:BB:CC:DD:EE:FF",
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
        title: "Success",
        description: "Device created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create device",
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
        title: "Success",
        description: "Credentials sent to device! Device will restart shortly.",
      });

      // Redirect to devices list after 2 seconds
      setTimeout(() => {
        router.push("/devices");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send credentials",
        variant: "destructive",
      });
    } finally {
      setSendingCredentials(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/devices")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Register New Device</h1>
          <p className="text-sm text-muted-foreground">
            Register ESP32 device to your smart home system
          </p>
        </div>
      </div>

      {/* Instructions Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Before you start</AlertTitle>
        <AlertDescription className="text-sm space-y-1">
          <ol className="list-decimal list-inside space-y-1">
            <li>Upload esp32-base firmware to your ESP32</li>
            <li>Open serial monitor and wait for device to boot</li>
            <li>Note the MAC address displayed (format: AA:BB:CC:DD:EE:FF)</li>
          </ol>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Step 1 & 2: Device Info and Create */}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>
              Enter device details and create in database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDevice} className="space-y-4">
              {/* MAC Address */}
              <div className="space-y-2">
                <Label htmlFor="mac">
                  MAC Address <span className="text-red-500">*</span>
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
                    onClick={() => copyToClipboard(macAddress, "MAC Address")}
                    disabled={!macAddress}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  From ESP32 serial monitor
                </p>
              </div>

              <Separator />

              {/* Device Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Device Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Kitchen Flame Sensor"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  disabled={!!createdDevice}
                />
              </div>

              {/* Device Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Device Type</Label>
                <Select
                  value={deviceType}
                  onValueChange={setDeviceType}
                  disabled={!!createdDevice}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SENSOR_NODE">Sensor Node</SelectItem>
                    <SelectItem value="LIGHT">Light</SelectItem>
                    <SelectItem value="FAN">Fan</SelectItem>
                    <SelectItem value="DOOR">Door</SelectItem>
                    <SelectItem value="POWER_METER">Power Meter</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Home */}
              <div className="space-y-2">
                <Label htmlFor="home">
                  Home <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedHome}
                  onValueChange={setSelectedHome}
                  disabled={!!createdDevice}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select home" />
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
                <Label htmlFor="room">Room (Optional)</Label>
                <Select
                  value={selectedRoom}
                  onValueChange={setSelectedRoom}
                  disabled={!!createdDevice || !selectedHome}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Create Device
                    </>
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
            <CardTitle className="flex items-center gap-2">
              {createdDevice && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              Send Credentials
            </CardTitle>
            <CardDescription>
              {createdDevice
                ? "Device created! Now send credentials to ESP32"
                : "Create device first to send credentials"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!createdDevice ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wifi className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Fill the form and create device first
                </p>
              </div>
            ) : (
              <>
                {/* Device Credentials */}
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Device ID:</span>
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
                            "Device ID",
                          )
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Device Key:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        {createdDevice.deviceKey.substring(0, 20)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(createdDevice.deviceKey, "Device Key")
                        }
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Name:</span>
                    <span className="text-sm">{createdDevice.deviceName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">MAC:</span>
                    <span className="text-sm font-mono">
                      {createdDevice.capabilities?.mac || macAddress}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Type:</span>
                    <Badge variant="outline">{createdDevice.deviceType}</Badge>
                  </div>
                </div>

                {/* Send Button */}
                <Alert>
                  <Send className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Click the button below to send credentials to your ESP32 via
                    MQTT. The device will restart automatically.
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Credentials to Device
                    </>
                  )}
                </Button>

                {/* What happens next */}
                <Alert>
                  <AlertTitle className="text-sm">
                    What happens next:
                  </AlertTitle>
                  <AlertDescription className="text-xs space-y-1">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>
                        Credentials sent via MQTT to:{" "}
                        <code>
                          devices/register/{macAddress.replace(/:/g, "")}
                        </code>
                      </li>
                      <li>ESP32 receives and saves credentials</li>
                      <li>ESP32 restarts automatically</li>
                      <li>Device connects and appears online</li>
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
          <CardTitle className="text-base">Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <h4 className="font-medium mb-2">
                Device not receiving credentials?
              </h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Check MQTT broker is running</li>
                <li>Check ESP32 is still online</li>
                <li>Verify MAC address is correct</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Device not appearing online?</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Check WiFi credentials in firmware</li>
                <li>Check MQTT server IP is correct</li>
                <li>Wait 30 seconds for heartbeat</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">MAC address already exists?</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Device was already registered</li>
                <li>Check devices list</li>
                <li>Delete old device if needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
