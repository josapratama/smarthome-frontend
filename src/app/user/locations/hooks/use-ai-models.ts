"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { toast } from "sonner";
import {
  getActiveModelForHome,
  setHomeModel,
  removeHomeModel,
  type ActiveModelForHome,
} from "@/lib/api/services/home-ai-models";

export interface ModelOption {
  name: string;
  algorithm: string;
  isActive: boolean;
}

// Static model lists — replace with API call when /api/v1/ai-models is available
const PREDICTION_MODELS: ModelOption[] = [
  { name: "moving_average_v1", algorithm: "Moving Average", isActive: true },
  {
    name: "linear_regression_v1",
    algorithm: "Linear Regression",
    isActive: true,
  },
  {
    name: "seasonal_decomp_v1",
    algorithm: "Seasonal Decomposition",
    isActive: false,
  },
];

const ANOMALY_MODELS: ModelOption[] = [
  {
    name: "isolation_forest_v1",
    algorithm: "Isolation Forest",
    isActive: true,
  },
  { name: "one_class_svm_v1", algorithm: "One-Class SVM", isActive: true },
  {
    name: "local_outlier_v1",
    algorithm: "Local Outlier Factor",
    isActive: false,
  },
];

export function useAiModels(homeId: number) {
  const { t } = useTranslation();
  const [predictionModel, setPredictionModel] =
    useState<ActiveModelForHome | null>(null);
  const [anomalyModel, setAnomalyModel] = useState<ActiveModelForHome | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState("");
  const [selectedAnomaly, setSelectedAnomaly] = useState("");
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [modelToRemove, setModelToRemove] = useState<
    "prediction" | "anomaly" | null
  >(null);

  const loadModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pred, anom] = await Promise.all([
        getActiveModelForHome(homeId, "prediction").catch(() => null),
        getActiveModelForHome(homeId, "anomaly").catch(() => null),
      ]);
      setPredictionModel(pred);
      setAnomalyModel(anom);
    } catch {
      // silently fail — models are optional
    } finally {
      setIsLoading(false);
    }
  }, [homeId]);

  const handleSetModel = async (
    modelType: "prediction" | "anomaly",
    modelName: string,
  ) => {
    try {
      await setHomeModel(homeId, modelType, modelName);
      toast.success(t("homeModelSet"));
      loadModels();
    } catch (error: any) {
      toast.error(error.message || t("failedSetHomeModel"));
    }
  };

  const handleRemoveModel = async () => {
    if (!modelToRemove) return;
    try {
      await removeHomeModel(homeId, modelToRemove);
      toast.success(t("homeModelRemoved"));
      setShowRemoveDialog(false);
      setModelToRemove(null);
      loadModels();
    } catch (error: any) {
      toast.error(error.message || t("failedRemoveHomeModel"));
    }
  };

  const confirmRemove = (modelType: "prediction" | "anomaly") => {
    setModelToRemove(modelType);
    setShowRemoveDialog(true);
  };

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  return {
    predictionModel,
    anomalyModel,
    isLoading,
    predictionModels: PREDICTION_MODELS,
    anomalyModels: ANOMALY_MODELS,
    selectedPrediction,
    setSelectedPrediction,
    selectedAnomaly,
    setSelectedAnomaly,
    showRemoveDialog,
    setShowRemoveDialog,
    modelToRemove,
    handleSetModel,
    handleRemoveModel,
    confirmRemove,
  };
}
