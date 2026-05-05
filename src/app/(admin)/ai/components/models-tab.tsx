"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Power,
  PowerOff,
  Trash2,
  TrendingUp,
  CheckCircle,
  Clock,
  Shield,
  BarChart3,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useToast } from "@/hooks/use-toast";
import {
  aiModelsApi,
  type AIModel,
  type CreateAIModelInput,
  type AIModelAlgorithm,
  type AIModelType,
} from "@/lib/api/services/ai-models";
import { ModelPerformanceTab } from "./model-performance-tab";

type ModelsMainTab = "list" | "performance";

export function ModelsTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [mainTab, setMainTab] = useState<ModelsMainTab>("list");
  const [selectedTab, setSelectedTab] = useState<AIModelType>("prediction");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAIModelInput>({
    name: "",
    version: "1.0.0",
    modelType: "prediction",
    algorithm: "moving_average",
    parameters: {},
    description: "",
  });

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: models, isLoading: modelsLoading } = useQuery<AIModel[]>({
    queryKey: ["ai-models", selectedTab],
    queryFn: () => aiModelsApi.getModels({ modelType: selectedTab }),
  });

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const createModelMutation = useMutation({
    mutationFn: aiModelsApi.createModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-models"] });
      toast({
        title: t("success"),
        description: t("modelCreatedSuccessfully"),
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () =>
      toast({
        title: t("error"),
        description: t("failedToCreateModel"),
        variant: "destructive",
      }),
  });

  const activateModelMutation = useMutation({
    mutationFn: aiModelsApi.activateModel,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ai-models"] });
      toast({
        title: t("success"),
        description:
          data.action === "deactivated"
            ? t("modelDeactivated")
            : t("modelActivated"),
      });
    },
  });

  const deleteModelMutation = useMutation({
    mutationFn: aiModelsApi.deleteModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-models"] });
      toast({ title: t("success"), description: t("modelDeleted") });
    },
    onError: () =>
      toast({
        title: t("error"),
        description: t("cannotDeleteActiveModel"),
        variant: "destructive",
      }),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData({
      name: "",
      version: "1.0.0",
      modelType: selectedTab,
      algorithm:
        selectedTab === "prediction" ? "moving_average" : "isolation_forest",
      parameters: {},
      description: "",
    });
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      ...formData,
      modelType: selectedTab,
      algorithm:
        selectedTab === "prediction" ? "moving_average" : "isolation_forest",
    });
    setIsCreateDialogOpen(true);
  };

  const getAlgorithmLabel = (algorithm: AIModelAlgorithm) => {
    const labels: Record<AIModelAlgorithm, string> = {
      moving_average: t("movingAverage"),
      linear_regression: t("linearRegression"),
      seasonal_decomposition: t("seasonalDecomposition"),
      isolation_forest: t("isolationForest"),
      one_class_svm: t("oneClassSvm"),
      local_outlier_factor: t("localOutlierFactor"),
    };
    return labels[algorithm] || algorithm;
  };

  // ── Model list renderer ───────────────────────────────────────────────────────
  const renderModelsList = () => {
    if (modelsLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      );
    }

    if (!models || models.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {t("noModelsFound")}
          </p>
          <Button
            onClick={handleOpenCreateDialog}
            className="mt-4"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("createFirstModel")}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {models.map((model) => (
          <Card key={model.id} className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {model.name}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      v{model.version}
                    </Badge>
                    {model.isActive ? (
                      <Badge
                        className="border-0"
                        style={{ backgroundColor: "#16a34a", color: "white" }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t("active")} • {t("inUse")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {t("inactive")}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {model.description || t("noDescription")}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      {t("algorithm")}: {getAlgorithmLabel(model.algorithm)}
                    </span>
                    <span>
                      <TrendingUp className="h-3 w-3 inline mr-1" />
                      {t("accuracy")}: {(model.avgAccuracy * 100).toFixed(1)}%
                    </span>
                    <span>
                      {t("predictions")}: {model.totalPredictions}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4 shrink-0">
                  {model.isActive ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => activateModelMutation.mutate(model.name)}
                      disabled={activateModelMutation.isPending}
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      <PowerOff className="h-4 w-4 mr-1" />
                      {t("deactivate")}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => activateModelMutation.mutate(model.name)}
                      disabled={activateModelMutation.isPending}
                      className="border-green-300 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950"
                    >
                      <Power className="h-4 w-4 mr-1" />
                      {t("activate")}
                    </Button>
                  )}
                  {!model.isActive && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteModelMutation.mutate(model.name)}
                      disabled={deleteModelMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <Tabs
        value={mainTab}
        onValueChange={(v) => setMainTab(v as ModelsMainTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t("modelList")}
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t("performance")}
          </TabsTrigger>
        </TabsList>

        {/* ── Model List ── */}
        <TabsContent value="list">
          <Card className="rounded-2xl shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("aiModels")}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("selectActiveModelDescription")}
                </p>
              </div>
              <Button onClick={handleOpenCreateDialog} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("createModel")}
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs
                value={selectedTab}
                onValueChange={(v) => setSelectedTab(v as AIModelType)}
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="prediction"
                    className="flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    {t("predictionModels")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="anomaly"
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    {t("anomalyModels")}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="prediction">
                  {renderModelsList()}
                </TabsContent>
                <TabsContent value="anomaly">{renderModelsList()}</TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Performance & Compare ── */}
        <TabsContent value="performance">
          <ModelPerformanceTab />
        </TabsContent>
      </Tabs>

      {/* ── Create Model Dialog ── */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTab === "prediction"
                ? t("createPredictionModel")
                : t("createAnomalyModel")}
            </DialogTitle>
            <DialogDescription>
              {selectedTab === "prediction"
                ? t("createAIModelDescription")
                : t("createAnomalyModelDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("modelName")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={
                  selectedTab === "prediction"
                    ? "moving-avg-v1"
                    : "isolation-forest-v1"
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">{t("version")}</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) =>
                  setFormData({ ...formData, version: e.target.value })
                }
                placeholder="1.0.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="algorithm">{t("algorithm")}</Label>
              <Select
                value={formData.algorithm}
                onValueChange={(value: AIModelAlgorithm) =>
                  setFormData({ ...formData, algorithm: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedTab === "prediction" ? (
                    <>
                      <SelectItem value="moving_average">
                        {t("movingAverage")}
                      </SelectItem>
                      <SelectItem value="linear_regression">
                        {t("linearRegression")}
                      </SelectItem>
                      <SelectItem value="seasonal_decomposition">
                        {t("seasonalDecomposition")}
                      </SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="isolation_forest">
                        {t("isolationForest")}
                      </SelectItem>
                      <SelectItem value="one_class_svm">
                        {t("oneClassSvm")}
                      </SelectItem>
                      <SelectItem value="local_outlier_factor">
                        {t("localOutlierFactor")}
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t("modelDescriptionPlaceholder")}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parameters">{t("parameters")} (JSON)</Label>
              <Textarea
                id="parameters"
                value={JSON.stringify(formData.parameters, null, 2)}
                onChange={(e) => {
                  try {
                    const params = JSON.parse(e.target.value);
                    setFormData({ ...formData, parameters: params });
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder={
                  selectedTab === "prediction"
                    ? '{"windowSize": 24, "smoothingFactor": 0.3}'
                    : '{"n_estimators": 100, "contamination": 0.1}'
                }
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={() => createModelMutation.mutate(formData)}
              disabled={
                createModelMutation.isPending ||
                !formData.name ||
                !formData.version
              }
            >
              {createModelMutation.isPending ? t("creating") : t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
