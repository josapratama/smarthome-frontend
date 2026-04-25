"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";
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
import { useTranslation } from "@/hooks/use-translation";
import { useAiModels } from "../hooks/use-ai-models";
import { HomeAiModelCard } from "./home-ai-model-card";

interface HomeAIModelsSectionProps {
  homeId: number;
  isOwner: boolean;
}

export function HomeAIModelsSection({
  homeId,
  isOwner,
}: HomeAIModelsSectionProps) {
  const { t } = useTranslation();
  const {
    predictionModel,
    anomalyModel,
    predictionModels,
    anomalyModels,
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
  } = useAiModels(homeId);

  if (!isOwner) return null;

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
        <HomeAiModelCard
          type="prediction"
          activeModel={predictionModel}
          availableModels={predictionModels}
          selectedModel={selectedPrediction}
          onSelectModel={setSelectedPrediction}
          onSetModel={() => handleSetModel("prediction", selectedPrediction)}
          onRemoveModel={() => confirmRemove("prediction")}
        />
        <HomeAiModelCard
          type="anomaly"
          activeModel={anomalyModel}
          availableModels={anomalyModels}
          selectedModel={selectedAnomaly}
          onSelectModel={setSelectedAnomaly}
          onSetModel={() => handleSetModel("anomaly", selectedAnomaly)}
          onRemoveModel={() => confirmRemove("anomaly")}
        />
      </div>

      {/* Info card */}
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

      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmRemoveHomeModel")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("removeHomeModelDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowRemoveDialog(false)}>
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
