"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { startTraining } from "@/lib/api/services/ai-training";
import { toast } from "sonner";

export function TrainingControlTab() {
  const { t } = useLanguage();
  const [starting, setStarting] = useState(false);
  const [modelType, setModelType] = useState<"prediction" | "anomaly" | "both">(
    "both",
  );
  const [deviceId, setDeviceId] = useState<string>("");

  const handleStartTraining = async () => {
    try {
      setStarting(true);
      const params: any = { modelType };
      if (deviceId) {
        params.deviceId = parseInt(deviceId);
      }

      const result = await startTraining(params);
      toast.success(`${t("trainingStarted")} (${t("job")} #${result.jobId})`);
    } catch (error) {
      toast.error(t("startTrainingError"));
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{t("manualTraining")}</h3>

        <div className="space-y-4">
          {/* Model Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("modelType")}
            </label>
            <select
              value={modelType}
              onChange={(e) =>
                setModelType(
                  e.target.value as "prediction" | "anomaly" | "both",
                )
              }
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="both">{t("both")}</option>
              <option value="prediction">{t("prediction")}</option>
              <option value="anomaly">{t("anomaly")}</option>
            </select>
          </div>

          {/* Device ID (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("deviceId")} ({t("optional")})
            </label>
            <input
              type="number"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder={t("allDevices")}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">{t("deviceIdHelp")}</p>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartTraining}
            disabled={starting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {starting ? t("starting") : t("startTraining")}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          {t("trainingInfo")}
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• {t("trainingInfoLine1")}</li>
          <li>• {t("trainingInfoLine2")}</li>
          <li>• {t("trainingInfoLine3")}</li>
        </ul>
      </div>
    </div>
  );
}
