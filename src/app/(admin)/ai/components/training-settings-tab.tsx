"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/use-translation";
import {
  getTrainingConfig,
  updateTrainingConfig,
  type TrainingConfig,
} from "@/lib/api/services/ai-training";
import { toast } from "sonner";

const DEFAULT_CONFIG: TrainingConfig = {
  schedule: "weekly",
  autoRetrain: true,
  minDataPoints: 1000,
  accuracyThreshold: 0.85,
  batchSize: 32,
  epochs: 100,
  learningRate: 0.001,
};

export function TrainingSettingsTab() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [config, setConfig] = useState<TrainingConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    if (!hasLoaded) loadConfig();
  }, [hasLoaded]);

  async function loadConfig() {
    try {
      setLoading(true);
      const data = await getTrainingConfig();
      setConfig(data);
      setHasLoaded(true);
    } catch {
      // silent on initial load
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await updateTrainingConfig(config);
      toast.success(t("configSaved"));
    } catch {
      toast.error(t("saveConfigError"));
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setConfig(DEFAULT_CONFIG);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schedule */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("schedule")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("scheduleFrequency")}</Label>
            <Select
              value={config.schedule}
              onValueChange={(v) =>
                setConfig({
                  ...config,
                  schedule: v as TrainingConfig["schedule"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">{t("manual")}</SelectItem>
                <SelectItem value="hourly">{t("hourly")}</SelectItem>
                <SelectItem value="daily">{t("daily")}</SelectItem>
                <SelectItem value="weekly">{t("weekly")}</SelectItem>
                <SelectItem value="monthly">{t("monthly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="autoRetrain"
              checked={config.autoRetrain}
              onCheckedChange={(v) => setConfig({ ...config, autoRetrain: v })}
            />
            <Label htmlFor="autoRetrain">{t("autoRetrain")}</Label>
          </div>
        </CardContent>
      </Card>

      {/* Parameters */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("parameters")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Min Data Points */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>{t("minDataPoints")}</Label>
              <span className="text-sm font-mono">{config.minDataPoints}</span>
            </div>
            <Slider
              min={100}
              max={10000}
              step={100}
              value={[config.minDataPoints]}
              onValueChange={([v]) =>
                setConfig({ ...config, minDataPoints: v })
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100</span>
              <span>10,000</span>
            </div>
          </div>

          {/* Accuracy Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>{t("accuracyThreshold")}</Label>
              <span className="text-sm font-mono">
                {(config.accuracyThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <Slider
              min={0.5}
              max={1.0}
              step={0.01}
              value={[config.accuracyThreshold]}
              onValueChange={([v]) =>
                setConfig({ ...config, accuracyThreshold: v })
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Batch Size */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>{t("batchSize")}</Label>
              <span className="text-sm font-mono">{config.batchSize}</span>
            </div>
            <Slider
              min={8}
              max={128}
              step={8}
              value={[config.batchSize]}
              onValueChange={([v]) => setConfig({ ...config, batchSize: v })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>8</span>
              <span>128</span>
            </div>
          </div>

          {/* Epochs */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>{t("epochs")}</Label>
              <span className="text-sm font-mono">{config.epochs}</span>
            </div>
            <Slider
              min={10}
              max={500}
              step={10}
              value={[config.epochs]}
              onValueChange={([v]) => setConfig({ ...config, epochs: v })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10</span>
              <span>500</span>
            </div>
          </div>

          {/* Learning Rate */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>{t("learningRate")}</Label>
              <span className="text-sm font-mono">
                {config.learningRate.toFixed(4)}
              </span>
            </div>
            <Slider
              min={0.0001}
              max={0.1}
              step={0.0001}
              value={[config.learningRate]}
              onValueChange={([v]) => setConfig({ ...config, learningRate: v })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.0001</span>
              <span>0.1</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? t("saving") : t("save")}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          {t("resetToDefaults")}
        </Button>
      </div>
    </div>
  );
}
