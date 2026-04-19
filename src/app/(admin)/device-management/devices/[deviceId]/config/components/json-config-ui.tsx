"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, RotateCcw, CheckCircle2, AlertCircle, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { upsertDeviceConfig } from "@/lib/api/services/device-config";

interface JsonConfigUIProps {
  deviceId: number;
  initialConfig: Record<string, any>;
  onSaved: () => void;
}

export function JsonConfigUI({
  deviceId,
  initialConfig,
  onSaved,
}: JsonConfigUIProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const originalText = JSON.stringify(initialConfig, null, 2);
  const [configText, setConfigText] = useState(originalText);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const hasChanges = configText !== originalText;
  const isValid = !jsonError && configText.trim().length > 0;

  const saveMutation = useMutation({
    mutationFn: async (cfg: Record<string, any>) => {
      await upsertDeviceConfig(deviceId, { config: cfg });
    },
    onSuccess: () => {
      onSaved();
      toast({ title: t("jsonConfigSaved") });
    },
    onError: (error: any) => {
      toast({
        title: t("jsonConfigSaveFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function handleChange(val: string) {
    setConfigText(val);
    try {
      JSON.parse(val);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  }

  function handleSave() {
    try {
      saveMutation.mutate(JSON.parse(configText));
    } catch (e: any) {
      toast({
        title: t("jsonInvalid"),
        description: e.message,
        variant: "destructive",
      });
    }
  }

  function handleReset() {
    setConfigText(originalText);
    setJsonError(null);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{t("jsonConfigTitle")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("jsonConfigDesc")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("reset")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || !hasChanges || saveMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? t("saving") : t("save")}
          </Button>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="rounded-xl">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  isValid
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-red-100 dark:bg-red-900"
                }`}
              >
                {isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">JSON</p>
                <p className="text-sm font-semibold">
                  {isValid ? t("jsonStatusValid") : t("jsonStatusInvalid")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  hasChanges
                    ? "bg-yellow-100 dark:bg-yellow-900"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <Code className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t("status")}</p>
                <p className="text-sm font-semibold">
                  {hasChanges ? t("jsonStatusModified") : t("jsonStatusSaved")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Editor */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="pt-5 pb-5">
          <Textarea
            value={configText}
            onChange={(e) => handleChange(e.target.value)}
            className="font-mono text-sm min-h-[300px] bg-muted/50"
            placeholder='{"key": "value"}'
          />
          {jsonError && (
            <div className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-700 dark:text-red-300">
                {jsonError}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
