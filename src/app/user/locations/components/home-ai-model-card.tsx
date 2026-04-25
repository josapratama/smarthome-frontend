"use client";

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
import { Brain, Globe, Home, Trash2, Check } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { ActiveModelForHome } from "@/lib/api/services/home-ai-models";
import type { ModelOption } from "../hooks/use-ai-models";

interface HomeAiModelCardProps {
  type: "prediction" | "anomaly";
  activeModel: ActiveModelForHome | null;
  availableModels: ModelOption[];
  selectedModel: string;
  onSelectModel: (name: string) => void;
  onSetModel: () => void;
  onRemoveModel: () => void;
}

const TYPE_COLOR = {
  prediction: "text-blue-500",
  anomaly: "text-purple-500",
};

export function HomeAiModelCard({
  type,
  activeModel,
  availableModels,
  selectedModel,
  onSelectModel,
  onSetModel,
  onRemoveModel,
}: HomeAiModelCardProps) {
  const { t } = useTranslation();
  const titleKey = type === "prediction" ? "predictionModel" : "anomalyModel";
  const activeModels = availableModels.filter((m) => m.isActive);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className={`h-5 w-5 ${TYPE_COLOR[type]}`} />
          {t(titleKey)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current model status */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t("currentModel")}</span>
            {activeModel?.source === "home" ? (
              <Badge className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                {t("homeSpecificModel")}
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {t("globalModel")}
              </Badge>
            )}
          </div>
          <div className="text-sm">
            {activeModel?.model ? (
              <>
                <div className="font-semibold">{activeModel.model.name}</div>
                <div className="text-muted-foreground">
                  {activeModel.model.algorithm}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">{t("noModelSet")}</div>
            )}
          </div>
        </div>

        {/* Set home-specific model */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("setModelForHome")}</label>
          <div className="flex gap-2">
            <Select value={selectedModel} onValueChange={onSelectModel}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectModel")} />
              </SelectTrigger>
              <SelectContent>
                {activeModels.map((model) => (
                  <SelectItem key={model.name} value={model.name}>
                    {model.algorithm}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={onSetModel} disabled={!selectedModel}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Remove home model */}
        {activeModel?.source === "home" && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onRemoveModel}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("removeHomeModel")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
