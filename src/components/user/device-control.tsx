"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Power, Lightbulb, Fan, Thermometer, Zap } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/client";

interface DeviceControlProps {
  deviceId: number;
  deviceType: string;
  deviceName: string;
  currentState?: any;
}

export function DeviceControl({
  deviceId,
  deviceType,
  deviceName,
  currentState,
}: DeviceControlProps) {
  const { t } = useTranslation();
  const [isOn, setIsOn] = useState(currentState?.power || false);
  const [brightness, setBrightness] = useState(currentState?.brightness || 50);
  const [temperature, setTemperature] = useState(
    currentState?.temperature || 24,
  );
  const [speed, setSpeed] = useState(currentState?.speed || 50);
  const [isSending, setIsSending] = useState(false);

  const sendCommand = async (command: string, payload: any) => {
    setIsSending(true);
    try {
      const response = await fetch(`/api/v1/devices/${deviceId}/commands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, payload }),
      });

      if (!response.ok) throw new Error("Failed to send command");

      toast.success(t("commandSent"));
    } catch (error: any) {
      toast.error(error.message || t("failedSendCommand"));
    } finally {
      setIsSending(false);
    }
  };

  const handlePowerToggle = async (checked: boolean) => {
    setIsOn(checked);
    await sendCommand("SET_POWER", { power: checked });
  };

  const handleBrightnessChange = async (value: number[]) => {
    setBrightness(value[0]);
  };

  const handleBrightnessCommit = async () => {
    await sendCommand("SET_BRIGHTNESS", { brightness });
  };

  const handleTemperatureChange = async (value: number[]) => {
    setTemperature(value[0]);
  };

  const handleTemperatureCommit = async () => {
    await sendCommand("SET_TEMPERATURE", { temperature });
  };

  const handleSpeedChange = async (value: number[]) => {
    setSpeed(value[0]);
  };

  const handleSpeedCommit = async () => {
    await sendCommand("SET_SPEED", { speed });
  };

  const renderControl = () => {
    const type = deviceType.toLowerCase();

    if (type.includes("light") || type.includes("lampu")) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              <Label htmlFor="power" className="text-lg">
                {t("power")}
              </Label>
            </div>
            <Switch
              id="power"
              checked={isOn}
              onCheckedChange={handlePowerToggle}
              disabled={isSending}
            />
          </div>

          {isOn && (
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">
                {t("brightness")}: {brightness}%
              </Label>
              <Slider
                value={[brightness]}
                onValueChange={handleBrightnessChange}
                onValueCommit={handleBrightnessCommit}
                max={100}
                step={1}
                disabled={isSending}
                className="w-full"
              />
            </div>
          )}
        </div>
      );
    }

    if (type.includes("fan") || type.includes("kipas")) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fan className="h-6 w-6 text-blue-500" />
              <Label htmlFor="power" className="text-lg">
                {t("power")}
              </Label>
            </div>
            <Switch
              id="power"
              checked={isOn}
              onCheckedChange={handlePowerToggle}
              disabled={isSending}
            />
          </div>

          {isOn && (
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">
                {t("speed")}: {speed}%
              </Label>
              <Slider
                value={[speed]}
                onValueChange={handleSpeedChange}
                onValueCommit={handleSpeedCommit}
                max={100}
                step={1}
                disabled={isSending}
                className="w-full"
              />
            </div>
          )}
        </div>
      );
    }

    if (type.includes("ac") || type.includes("thermostat")) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Thermometer className="h-6 w-6 text-blue-500" />
              <Label htmlFor="power" className="text-lg">
                {t("power")}
              </Label>
            </div>
            <Switch
              id="power"
              checked={isOn}
              onCheckedChange={handlePowerToggle}
              disabled={isSending}
            />
          </div>

          {isOn && (
            <div className="space-y-3">
              <Label className="text-sm text-muted-foreground">
                {t("temperature")}: {temperature}°C
              </Label>
              <Slider
                value={[temperature]}
                onValueChange={handleTemperatureChange}
                onValueCommit={handleTemperatureCommit}
                min={16}
                max={30}
                step={1}
                disabled={isSending}
                className="w-full"
              />
            </div>
          )}
        </div>
      );
    }

    // Default control for other devices
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Power className="h-6 w-6 text-primary" />
          <Label htmlFor="power" className="text-lg">
            {t("power")}
          </Label>
        </div>
        <Switch
          id="power"
          checked={isOn}
          onCheckedChange={handlePowerToggle}
          disabled={isSending}
        />
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          {t("deviceControl")}
        </CardTitle>
      </CardHeader>
      <CardContent>{renderControl()}</CardContent>
    </Card>
  );
}
