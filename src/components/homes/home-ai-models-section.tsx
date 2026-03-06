"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Brain, Globe, Home, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import {
  getActiveModelForHome,
  setHomeModel,
  removeHomeModel,
  type ActiveModelForHome,
} from "@/lib/api/home-ai-models";

interface HomeAIModelsSectionProps {
  homeId: number;
  isOwner: boolean;
}

interface ModelOption {
  name: string;
  algorithm: string;
  isActive: boolean;
}

export function HomeAIModelsSection({
  homeId,
  isOwner,
}: HomeAIModelsSectionProps) {
  const { t } = useTranslation();
  const [predictionModel, setPredictionModel] =
    useState<ActiveModelForHome | null>(null);
  const [anomalyModel, setAnomalyModel] = useState<ActiveModelForHome | null>(
    null,
  );
  const [availablePredictionModels, setAvailablePredictionModels] = useState<
    ModelOption[]
  >([]);
  const [availableAnomalyModels, setAvailableAnomalyModels] = useState<
    ModelOption[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPredictionModel, setSelectedPredictionModel] = useState("");
  const [selectedAnomalyModel, setSelectedAnomalyModel] = useState("");
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [modelToRemove, setModelToRemove] = useState<
    "prediction" | "anomaly" | null
  >(null);

  useEffect(() => {
    loadModels();
  }, [homeId]);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      // Load active models for this home
      const [predModel, anomModel] = await Promise.all([
        getActiveModelForHome(homeId, "prediction").catch(() => null),
        getActiveModelForHome(homeId, "anomaly").catch(() => null),
      ]);

      setPredictionModel(predModel);
      setAnomalyModel(anomModel);

      // Load available models from API
      // For now, we'll use mock data. In production, fetch from /api/v1/ai-models
      const mockPredictionModels: ModelOption[] = [
        {
          name: "moving_average_v1",
          algorithm: "Moving Average",
          isActive: true,
        },
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

      const mockAnomalyModels: ModelOption[] = [
        {
          name: "isolation_forest_v1",
          algorithm: "Isolation Forest",
          isActive: true,
        },
        {
          name: "one_class_svm_v1",
          algorithm: "One-Class SVM",
          isActive: true,
        },
        {
          name: "local_outlier_v1",
          algorithm: "Local Outlier Factor",
          isActive: false,
        },
      ];

      setAvailablePredictionModels(mockPredictionModels);
      setAvailableAnomalyModels(mockAnomalyModels);
    } catch (error) {
      console.error("Failed to load AI models:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const confirmRemoveModel = (modelType: "prediction" | "anomaly") => {
    setModelToRemove(modelType);
    setShowRemoveDialog(true);
  };

  if (!isOwner) {
    return null; // Only show to home owner
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          {t("homeAIModels")}
        </h2>
      </div>

      <p className="text-sm text-muted-foreground">{t("manageHomeAIModels")}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prediction Model */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              {t("predictionModel")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Model Status */}
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t("currentModel")}</span>
                {predictionModel?.source === "home" ? (
                  <Badge className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    {t("homeSpecificModel")}
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Globe className="h-3 w-3" />
                    {t("globalModel")}
                  </Badge>
                )}
              </div>
              <div className="text-sm">
                {predictionModel?.model ? (
                  <>
                    <div className="font-semibold">
                      {predictionModel.model.name}
                    </div>
                    <div className="text-muted-foreground">
                      {predictionModel.model.algorithm}
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">{t("noModelSet")}</div>
                )}
              </div>
            </div>

            {/* Set Home-Specific Model */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("setModelForHome")}
              </label>
              <div className="flex gap-2">
                <Select
                  value={selectedPredictionModel}
                  onValueChange={setSelectedPredictionModel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectModel")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePredictionModels
                      .filter((m) => m.isActive)
                      .map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          {model.algorithm}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() =>
                    handleSetModel("prediction", selectedPredictionModel)
                  }
                  disabled={!selectedPredictionModel}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Remove Home Model */}
            {predictionModel?.source === "home" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => confirmRemoveModel("prediction")}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("removeHomeModel")}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Anomaly Model */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              {t("anomalyModel")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Model Status */}
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t("currentModel")}</span>
                {anomalyModel?.source === "home" ? (
                  <Badge className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    {t("homeSpecificModel")}
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Globe className="h-3 w-3" />
                    {t("globalModel")}
                  </Badge>
                )}
              </div>
              <div className="text-sm">
                {anomalyModel?.model ? (
                  <>
                    <div className="font-semibold">
                      {anomalyModel.model.name}
                    </div>
                    <div className="text-muted-foreground">
                      {anomalyModel.model.algorithm}
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">{t("noModelSet")}</div>
                )}
              </div>
            </div>

            {/* Set Home-Specific Model */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("setModelForHome")}
              </label>
              <div className="flex gap-2">
                <Select
                  value={selectedAnomalyModel}
                  onValueChange={setSelectedAnomalyModel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectModel")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAnomalyModels
                      .filter((m) => m.isActive)
                      .map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          {model.algorithm}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() =>
                    handleSetModel("anomaly", selectedAnomalyModel)
                  }
                  disabled={!selectedAnomalyModel}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Remove Home Model */}
            {anomalyModel?.source === "home" && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => confirmRemoveModel("anomaly")}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("removeHomeModel")}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Brain className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">{t("aboutHomeAIModels")}</p>
              <p className="text-blue-700 dark:text-blue-300">
                {t("homeAIModelsDescription")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmRemoveHomeModel")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("removeHomeModelDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setModelToRemove(null)}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveModel}>
              {t("removeModel")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
