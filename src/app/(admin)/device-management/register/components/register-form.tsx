"use client";

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
import { Separator } from "@/components/ui/separator";
import { Copy, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { RegisterHome, RegisterRoom } from "../lib/register.types";

interface RegisterFormProps {
  macAddress: string;
  deviceName: string;
  deviceType: string;
  selectedHome: string;
  selectedRoom: string;
  homes: RegisterHome[];
  rooms: RegisterRoom[];
  isSubmitting: boolean;
  isDisabled: boolean;
  onMacChange: (val: string) => void;
  onNameChange: (val: string) => void;
  onTypeChange: (val: string) => void;
  onHomeChange: (val: string) => void;
  onRoomChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCopyMac: () => void;
}

export function RegisterForm({
  macAddress,
  deviceName,
  deviceType,
  selectedHome,
  selectedRoom,
  homes,
  rooms,
  isSubmitting,
  isDisabled,
  onMacChange,
  onNameChange,
  onTypeChange,
  onHomeChange,
  onRoomChange,
  onSubmit,
  onCopyMac,
}: RegisterFormProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>{t("deviceInformation")}</CardTitle>
        <CardDescription>{t("enterDeviceDetailsAndCreate")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
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
                onChange={(e) => onMacChange(e.target.value)}
                className="font-mono"
                disabled={isDisabled}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onCopyMac}
                disabled={!macAddress}
                title={t("copy")}
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
              placeholder={t("deviceNamePlaceholder")}
              value={deviceName}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={isDisabled}
            />
          </div>

          {/* Device Type */}
          <div className="space-y-2">
            <Label htmlFor="type">{t("deviceType")}</Label>
            <Select
              value={deviceType}
              onValueChange={onTypeChange}
              disabled={isDisabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SENSOR_NODE">{t("sensorNode")}</SelectItem>
                <SelectItem value="LIGHT">{t("light")}</SelectItem>
                <SelectItem value="FAN">{t("fan")}</SelectItem>
                <SelectItem value="DOOR">{t("door")}</SelectItem>
                <SelectItem value="POWER_METER">{t("powerMeter")}</SelectItem>
                <SelectItem value="ENERGY_MONITOR">Energy Monitor</SelectItem>
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
              onValueChange={onHomeChange}
              disabled={isDisabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectHome")} />
              </SelectTrigger>
              <SelectContent>
                {homes.map((home) => (
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
              onValueChange={onRoomChange}
              disabled={isDisabled || !selectedHome}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectRoom")} />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id.toString()}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isDisabled && (
            <Button
              type="submit"
              className="w-full"
              disabled={
                isSubmitting || !macAddress || !deviceName || !selectedHome
              }
            >
              {isSubmitting ? (
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
  );
}
