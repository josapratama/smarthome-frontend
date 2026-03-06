"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Home, Globe, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";
import { getHomes, type Home as HomeType } from "@/lib/api/homes";
import { aiModelsApi, type AIModel } from "@/lib/api/ai-models";
import {
  getHomeModels,
  setHomeModel,
  removeHomeModel,
  getActiveModelForHome,
  applyModelToAllHomes,
  type HomeAIModel,
  type ActiveModelForHome,
} from "@/lib/api/home-ai-models";

export function HomeModelsTab() {
  const { t } = useLanguage();
  const [homes, setHomes] = useState<HomeType[]>([]);
  const [predictionModels, setPredictionModels] = useState<AIModel[]>([]);
  const [anomalyModels, setAnomalyModels] = useState<AIModel[]>([]);
  const [selectedHome, setSelectedHome] = useState<number | null>(null);
  const [homeModels, setHomeModels] = useState<HomeAIModel[]>([]);
  const [activeModels, setActiveModels] = useState<{
    prediction?: ActiveModelForHome;
    anomaly?: ActiveModelForHome;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedHome) {
      loadHomeModels(selectedHome);
    }
  }, [selectedHome]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [homesData, modelsData] = await Promise.all([
        getHomes(),
        aiModelsApi.getModels(),
      ]);

      console.log("Homes data:", homesData);
      console.log("Models data:", modelsData);

      setHomes(homesData || []);
      setPredictionModels(
        (modelsData || []).filter((m: AIModel) => m.modelType === "prediction"),
      );
      setAnomalyModels(
        (modelsData || []).filter((m: AIModel) => m.modelType === "anomaly"),
      );

      if (homesData && homesData.length > 0 && !selectedHome) {
        setSelectedHome(homesData[0].id);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error(t("failedLoadData"));
    } finally {
      setIsLoading(false);
    }
  };

  const loadHomeModels = async (homeId: number) => {
    setIsLoading(true);
    try {
      const [models, predictionActive, anomalyActive] = await Promise.all([
        getHomeModels(homeId),
        getActiveModelForHome(homeId, "prediction").catch(() => null),
        getActiveModelForHome(homeId, "anomaly").catch(() => null),
      ]);
      setHomeModels(models);
      setActiveModels({
        prediction: predictionActive || undefined,
        anomaly: anomalyActive || undefined,
      });
    } catch (error) {
      console.error("Error loading home models:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetModel = async (
    modelType: "prediction" | "anomaly",
    modelName: string,
  ) => {
    if (!selectedHome) return;

    try {
      await setHomeModel(selectedHome, modelType, modelName);
      toast.success(t("homeModelSet"));
      loadHomeModels(selectedHome);
    } catch (error) {
      console.error("Error setting home model:", error);
      toast.error(t("failedSetHomeModel"));
    }
  };

  const handleRemoveModel = async (modelType: "prediction" | "anomaly") => {
    if (!selectedHome) return;

    if (!confirm(t("confirmRemoveHomeModel"))) return;

    try {
      await removeHomeModel(selectedHome, modelType);
      toast.success(t("homeModelRemoved"));
      loadHomeModels(selectedHome);
    } catch (error) {
      console.error("Error removing home model:", error);
      toast.error(t("failedRemoveHomeModel"));
    }
  };

  const handleApplyToAll = async (
    modelType: "prediction" | "anomaly",
    modelName?: string,
  ) => {
    const confirmMsg = modelName
      ? t("confirmApplyToAll")
      : t("confirmUseGlobalForAll");

    if (!confirm(confirmMsg)) return;

    try {
      const result = await applyModelToAllHomes(modelType, modelName);
      if (result.appliedCount) {
        toast.success(
          `${t("modelAppliedToAll")} (${result.appliedCount} ${t("homes")})`,
        );
      } else {
        toast.success(t("globalModelApplied"));
      }
      if (selectedHome) {
        loadHomeModels(selectedHome);
      }
    } catch (error) {
      console.error("Error applying to all homes:", error);
      toast.error(t("failedApplyToAll"));
    }
  };

  const renderModelCard = (
    modelType: "prediction" | "anomaly",
    models: AIModel[],
  ) => {
    const activeModel = activeModels[modelType];
    const homeModel = homeModels.find((hm) => hm.modelType === modelType);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {modelType === "prediction"
                ? t("predictionModel")
                : t("anomalyModel")}
            </span>
            {activeModel && (
              <Badge
                variant="outline"
                style={{
                  backgroundColor:
                    activeModel.source === "home" ? "#22c55e" : "#3b82f6",
                  color: "white",
                }}
              >
                {activeModel.source === "home" ? (
                  <>
                    <Home className="h-3 w-3 mr-1" />
                    {t("homeSpecificModel")}
                  </>
                ) : (
                  <>
                    <Globe className="h-3 w-3 mr-1" />
                    {t("globalModel")}
                  </>
                )}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeModel && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-1">
                {t("currentModel")}
              </div>
              <div className="text-lg font-bold">{activeModel.model.name}</div>
              <div className="text-sm text-muted-foreground">
                {activeModel.model.algorithm} • v{activeModel.model.version}
              </div>
              {activeModel.model.description && (
                <div className="text-sm mt-2">
                  {activeModel.model.description}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("selectModelForHome")}
            </label>
            <div className="flex gap-2">
              <Select
                onValueChange={(value) => handleSetModel(modelType, value)}
                value={homeModel?.modelName || ""}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t("selectModel")} />
                </SelectTrigger>
                <SelectContent>
                  {models
                    .filter((m) => m.isActive)
                    .map((model) => (
                      <SelectItem key={model.name} value={model.name}>
                        {model.name} ({model.algorithm})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {homeModel && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveModel(modelType)}
                  title={t("removeModel")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <div className="text-sm font-medium">{t("applyToAllHomes")}</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApplyToAll(modelType)}
                className="flex-1"
              >
                <Globe className="h-4 w-4 mr-2" />
                {t("useGlobalForAll")}
              </Button>
              {homeModel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleApplyToAll(modelType, homeModel.modelName)
                  }
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {t("applyModel")}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("homeModelManagement")}</h2>
          <p className="text-muted-foreground">{t("manageHomeAIModels")}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => selectedHome && loadHomeModels(selectedHome)}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          {t("refresh")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("selectHome")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : homes.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {t("noHomesYet")}
            </div>
          ) : (
            <Select
              value={selectedHome?.toString() || ""}
              onValueChange={(value) => setSelectedHome(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectHome")} />
              </SelectTrigger>
              <SelectContent>
                {(homes || []).map((home) => (
                  <SelectItem key={home.id} value={home.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      {home.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedHome && !isLoading && (
        <div className="grid gap-6 md:grid-cols-2">
          {renderModelCard("prediction", predictionModels)}
          {renderModelCard("anomaly", anomalyModels)}
        </div>
      )}
    </div>
  );
}
