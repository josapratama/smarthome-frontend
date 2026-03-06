"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import {
  aiModelsApi,
  type AIModel,
  type CreateAIModelInput,
  type AIModelAlgorithm,
} from "@/lib/api/ai-models";

export function ModelsTab() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAIModelInput>({
    name: "",
    version: "1.0.0",
    algorithm: "moving_average",
    parameters: {},
    description: "",
  });

  // Fetch AI models
  const { data: models, isLoading: modelsLoading } = useQuery<AIModel[]>({
    queryKey: ["ai-models"],
    queryFn: () => aiModelsApi.getModels(),
  });

  // Create model mutation
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
    onError: () => {
      toast({
        title: t("error"),
        description: t("failedToCreateModel"),
        variant: "destructive",
      });
    },
  });

  // Activate model mutation
  const activateModelMutation = useMutation({
    mutationFn: aiModelsApi.activateModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-models"] });
      toast({
        title: t("success"),
        description: t("modelActivated"),
      });
    },
  });

  // Delete model mutation
  const deleteModelMutation = useMutation({
    mutationFn: aiModelsApi.deleteModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-models"] });
      toast({
        title: t("success"),
        description: t("modelDeleted"),
      });
    },
    onError: () => {
      toast({
        title: t("error"),
        description: t("cannotDeleteActiveModel"),
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      version: "1.0.0",
      algorithm: "moving_average",
      parameters: {},
      description: "",
    });
  };

  const handleCreateModel = () => {
    createModelMutation.mutate(formData);
  };

  const getAlgorithmLabel = (algorithm: AIModelAlgorithm) => {
    const labels: Record<AIModelAlgorithm, string> = {
      moving_average: t("movingAverage"),
      linear_regression: t("linearRegression"),
      seasonal_decomposition: t("seasonalDecomposition"),
    };
    return labels[algorithm] || algorithm;
  };

  return (
    <>
      <Card className="rounded-2xl shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            {t("aiModels")}
          </CardTitle>
          <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4" />
            {t("createModel")}
          </Button>
        </CardHeader>
        <CardContent>
          {modelsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !models || models.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {t("noModelsFound")}
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-4"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                {t("createFirstModel")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {models.map((model) => (
                <Card
                  key={model.id}
                  className="border-gray-200 dark:border-gray-700"
                >
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
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {t("active")}
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

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>
                            {t("algorithm")}:{" "}
                            {getAlgorithmLabel(model.algorithm)}
                          </span>
                          <span>
                            <TrendingUp className="h-3 w-3 inline mr-1" />
                            {t("accuracy")}:{" "}
                            {(model.avgAccuracy * 100).toFixed(1)}%
                          </span>
                          <span>
                            {t("predictions")}: {model.totalPredictions}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!model.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              activateModelMutation.mutate(model.name)
                            }
                            disabled={activateModelMutation.isPending}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        )}
                        {!model.isActive && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              deleteModelMutation.mutate(model.name)
                            }
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
          )}
        </CardContent>
      </Card>

      {/* Create Model Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("createAIModel")}</DialogTitle>
            <DialogDescription>
              {t("createAIModelDescription")}
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
                placeholder="moving-avg-v1"
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
                  <SelectItem value="moving_average">
                    {t("movingAverage")}
                  </SelectItem>
                  <SelectItem value="linear_regression">
                    {t("linearRegression")}
                  </SelectItem>
                  <SelectItem value="seasonal_decomposition">
                    {t("seasonalDecomposition")}
                  </SelectItem>
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
                placeholder='{"windowSize": 24, "smoothingFactor": 0.3}'
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
              onClick={handleCreateModel}
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
