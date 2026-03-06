"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Settings,
  AlertCircle,
  CheckCircle2,
  Code,
} from "lucide-react";
import { getDeviceConfig, upsertDeviceConfig } from "@/lib/api/device-config";

export function DeviceConfigClient() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const deviceId = Number(params.deviceId);

  const [configText, setConfigText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Fetch device config
  const configQuery = useQuery({
    queryKey: ["device-config", deviceId],
    queryFn: async () => {
      const response = await getDeviceConfig(deviceId);
      const config = response.data.config;
      setConfigText(JSON.stringify(config, null, 2));
      return response.data;
    },
    enabled: !!deviceId,
  });

  // Update config mutation
  const updateMutation = useMutation({
    mutationFn: async (config: Record<string, any>) => {
      return upsertDeviceConfig(deviceId, { config });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["device-config", deviceId] });
      toast({
        title: t("deviceConfigUpdated"),
        description: t("configSavedSuccessfully"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("failedToUpdateConfig"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConfigChange = (value: string) => {
    setConfigText(value);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const handleSave = () => {
    try {
      const config = JSON.parse(configText);
      updateMutation.mutate(config);
    } catch (e: any) {
      toast({
        title: t("invalidJSON"),
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    if (configQuery.data) {
      setConfigText(JSON.stringify(configQuery.data.config, null, 2));
      setJsonError(null);
    }
  };

  const isValidJson = !jsonError && configText.trim().length > 0;
  const hasChanges =
    configQuery.data &&
    configText !== JSON.stringify(configQuery.data.config, null, 2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/devices/${deviceId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {t("deviceConfiguration")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("manageDeviceSettings")}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || configQuery.isLoading}
          >
            <RotateCcw className="h-4 w-4" />
            {t("reset")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValidJson || !hasChanges || updateMutation.isPending}
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? t("saving") : t("saveChanges")}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("deviceId")}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  #{deviceId}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  isValidJson
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-red-100 dark:bg-red-900"
                }`}
              >
                {isValidJson ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("jsonStatus")}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {isValidJson ? t("valid") : t("invalid")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  hasChanges
                    ? "bg-yellow-100 dark:bg-yellow-900"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <Code className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("status")}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {hasChanges ? t("modified") : t("saved")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Config Editor */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("configurationEditor")}
            </CardTitle>
            {configQuery.data && (
              <Badge variant="outline" className="text-xs">
                {t("lastUpdated")}:{" "}
                {new Date(configQuery.data.updatedAt).toLocaleString()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {configQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : configQuery.error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t("errorLoadingConfig")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("failedToLoadDeviceConfig")}
              </p>
              <Button
                className="mt-4"
                onClick={() => configQuery.refetch()}
                variant="outline"
              >
                {t("retry")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  value={configText}
                  onChange={(e) => handleConfigChange(e.target.value)}
                  className="font-mono text-sm min-h-[400px] bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                  placeholder={t("enterJSONConfig")}
                />
                {jsonError && (
                  <div className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-900 dark:text-red-100">
                          {t("jsonError")}
                        </p>
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                          {jsonError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {t("configurationNote")}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      {t("configWillBeSentToDevice")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
