"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import {
  getTrainingConfig,
  updateTrainingConfig,
  type TrainingConfig,
} from "@/lib/api/services/ai-training";
import { toast } from "sonner";

export function TrainingSettingsTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [config, setConfig] = useState<TrainingConfig>({
    schedule: "weekly",
    autoRetrain: true,
    minDataPoints: 1000,
    accuracyThreshold: 0.85,
    batchSize: 32,
    epochs: 100,
    learningRate: 0.001,
  });

  useEffect(() => {
    // Only load once when component first mounts
    if (!hasLoaded) {
      loadConfig();
    }
  }, [hasLoaded]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await getTrainingConfig();
      setConfig(data);
      setHasLoaded(true);
    } catch (error) {
      // Silently fail on initial load to avoid toast spam
      console.error("Failed to load training config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateTrainingConfig(config);
      toast.success(t("configSaved"));
    } catch (error) {
      toast.error(t("saveConfigError"));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      schedule: "weekly",
      autoRetrain: true,
      minDataPoints: 1000,
      accuracyThreshold: 0.85,
      batchSize: 32,
      epochs: 100,
      learningRate: 0.001,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{t("schedule")}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("scheduleFrequency")}
            </label>
            <select
              value={config.schedule}
              onChange={(e) =>
                setConfig({
                  ...config,
                  schedule: e.target.value as TrainingConfig["schedule"],
                })
              }
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="manual">{t("manual")}</option>
              <option value="hourly">{t("hourly")}</option>
              <option value="daily">{t("daily")}</option>
              <option value="weekly">{t("weekly")}</option>
              <option value="monthly">{t("monthly")}</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoRetrain"
              checked={config.autoRetrain}
              onChange={(e) =>
                setConfig({ ...config, autoRetrain: e.target.checked })
              }
              className="mr-2"
            />
            <label htmlFor="autoRetrain" className="text-sm">
              {t("autoRetrain")}
            </label>
          </div>
        </div>
      </div>

      {/* Training Parameters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{t("parameters")}</h3>
        <div className="space-y-6">
          {/* Min Data Points */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("minDataPoints")}: {config.minDataPoints}
            </label>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={config.minDataPoints}
              onChange={(e) =>
                setConfig({
                  ...config,
                  minDataPoints: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>100</span>
              <span>10,000</span>
            </div>
          </div>

          {/* Accuracy Threshold */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("accuracyThreshold")}:{" "}
              {(config.accuracyThreshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.01"
              value={config.accuracyThreshold}
              onChange={(e) =>
                setConfig({
                  ...config,
                  accuracyThreshold: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Batch Size */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("batchSize")}: {config.batchSize}
            </label>
            <input
              type="range"
              min="8"
              max="128"
              step="8"
              value={config.batchSize}
              onChange={(e) =>
                setConfig({ ...config, batchSize: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>8</span>
              <span>128</span>
            </div>
          </div>

          {/* Epochs */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("epochs")}: {config.epochs}
            </label>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={config.epochs}
              onChange={(e) =>
                setConfig({ ...config, epochs: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10</span>
              <span>500</span>
            </div>
          </div>

          {/* Learning Rate */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("learningRate")}: {config.learningRate.toFixed(4)}
            </label>
            <input
              type="range"
              min="0.0001"
              max="0.1"
              step="0.0001"
              value={config.learningRate}
              onChange={(e) =>
                setConfig({
                  ...config,
                  learningRate: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.0001</span>
              <span>0.1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? t("saving") : t("save")}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {t("resetToDefaults")}
        </button>
      </div>
    </div>
  );
}
