"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Save,
  RotateCcw,
  FileJson,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { deviceConfigApi } from "@/lib/api/device-config";
import { toast } from "sonner";

interface DeviceConfigProps {
  deviceId: number;
}

export default function DeviceConfig({ deviceId }: DeviceConfigProps) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<any>(null);
  const [configText, setConfigText] = useState("");
  const [originalConfig, setOriginalConfig] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [deviceId]);

  useEffect(() => {
    setHasChanges(configText !== originalConfig);
    validateJson(configText);
  }, [configText, originalConfig]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const data = await deviceConfigApi.get(deviceId);
      if (data) {
        const formatted = JSON.stringify(data.config, null, 2);
        setConfig(data);
        setConfigText(formatted);
        setOriginalConfig(formatted);
      } else {
        // No config exists, create empty template
        const template = {
          mqtt: {
            broker: "mqtt://localhost:1883",
            clientId: `device_${deviceId}`,
            username: "",
            password: "",
          },
          wifi: {
            ssid: "",
            password: "",
          },
          sensors: [],
          actuators: [],
          updateInterval: 60,
        };
        const formatted = JSON.stringify(template, null, 2);
        setConfigText(formatted);
        setOriginalConfig(formatted);
      }
    } catch (error: any) {
      toast.error(error.message || t("failedToLoadConfig"));
    } finally {
      setIsLoading(false);
    }
  };

  const validateJson = (text: string) => {
    try {
      if (text.trim()) {
        JSON.parse(text);
        setJsonError(null);
      }
    } catch (error: any) {
      setJsonError(error.message);
    }
  };

  const handleSave = async () => {
    if (jsonError) {
      toast.error(t("invalidJson"));
      return;
    }

    setIsSaving(true);
    try {
      const parsedConfig = JSON.parse(configText);
      await deviceConfigApi.update(deviceId, parsedConfig);
      toast.success(t("configSaved"));
      setOriginalConfig(configText);
      loadConfig();
    } catch (error: any) {
      toast.error(error.message || t("failedToSaveConfig"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setConfigText(originalConfig);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(configText);
      const formatted = JSON.stringify(parsed, null, 2);
      setConfigText(formatted);
      toast.success(t("jsonFormatted"));
    } catch (error) {
      toast.error(t("invalidJson"));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              {t("deviceConfiguration")}
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <span className="text-sm text-orange-600">
                  {t("unsavedChanges")}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* JSON Validation Status */}
          {jsonError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("jsonError")}: {jsonError}
              </AlertDescription>
            </Alert>
          ) : hasChanges ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{t("unsavedChangesWarning")}</AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                {t("validJson")}
              </AlertDescription>
            </Alert>
          )}

          {/* JSON Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{t("jsonConfig")}</label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleFormat}
                disabled={!!jsonError}
              >
                {t("format")}
              </Button>
            </div>
            <Textarea
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              className="font-mono text-sm min-h-[400px]"
              placeholder={t("enterJsonConfig")}
            />
          </div>

          {/* Help Text */}
          <Alert>
            <AlertDescription className="text-xs">
              <strong>{t("tip")}:</strong> {t("configHelpText")}
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || !!jsonError || isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? t("saving") : t("save")}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t("reset")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Config Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>{t("configurationGuide")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">{t("commonFields")}:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>
                <code className="bg-muted px-1 rounded">mqtt</code> -{" "}
                {t("mqttSettings")}
              </li>
              <li>
                <code className="bg-muted px-1 rounded">wifi</code> -{" "}
                {t("wifiSettings")}
              </li>
              <li>
                <code className="bg-muted px-1 rounded">sensors</code> -{" "}
                {t("sensorConfiguration")}
              </li>
              <li>
                <code className="bg-muted px-1 rounded">actuators</code> -{" "}
                {t("actuatorConfiguration")}
              </li>
              <li>
                <code className="bg-muted px-1 rounded">updateInterval</code> -{" "}
                {t("updateIntervalSeconds")}
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">{t("exampleConfig")}:</h4>
            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
              {`{
  "mqtt": {
    "broker": "mqtt://192.168.1.100:1883",
    "clientId": "device_${deviceId}",
    "username": "mqtt_user",
    "password": "mqtt_pass"
  },
  "wifi": {
    "ssid": "MyWiFi",
    "password": "wifi_password"
  },
  "sensors": [
    {
      "type": "DHT22",
      "pin": 4,
      "interval": 60
    }
  ],
  "updateInterval": 30
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
