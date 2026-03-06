"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Brain, TrendingUp, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useToast } from "@/hooks/use-toast";
import {
  getAIStats,
  getEnergyPredictions,
  getAnomalies,
  getAIRules,
  createAIRule,
  updateAIRule,
  deleteAIRule,
  type AIStats,
  type EnergyPrediction,
  type Anomaly,
  type AIRule,
} from "@/lib/api/ai";
import { AIStatsCards } from "./ai-stats-cards";
import { PredictionsTab } from "./predictions-tab";
import { AnomaliesTab } from "./anomalies-tab";
import { RulesTab } from "./rules-tab";
import { ModelsTab } from "./models-tab";
import { HomeModelsTab } from "./home-models-tab";
import { CreateRuleDialog } from "./create-rule-dialog";
import type { AITab, CreateRuleFormData } from "./types";

export default function AIPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState<AITab>("predictions");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateRuleFormData>({
    name: "",
    description: "",
    type: "automation",
    conditions: {
      trigger: "sensor_value",
      operator: "gt",
      value: 0,
    },
    actions: {
      actionType: "control_device",
      command: "OFF",
    },
    priority: 50,
  });

  // Fetch AI stats
  const { data: stats, isLoading: statsLoading } = useQuery<AIStats>({
    queryKey: ["ai-stats"],
    queryFn: getAIStats,
  });

  // Fetch energy predictions
  const { data: predictions, isLoading: predictionsLoading } = useQuery<
    EnergyPrediction[]
  >({
    queryKey: ["energy-predictions"],
    queryFn: () => getEnergyPredictions({ limit: 10 }),
  });

  // Fetch anomalies
  const { data: anomalies, isLoading: anomaliesLoading } = useQuery<Anomaly[]>({
    queryKey: ["ai-anomalies"],
    queryFn: () => getAnomalies({ status: "ALL", limit: 20 }),
  });

  // Fetch AI rules
  const { data: rules, isLoading: rulesLoading } = useQuery<AIRule[]>({
    queryKey: ["ai-rules"],
    queryFn: () => getAIRules({ type: "all", isActive: "all" }),
  });

  // Create rule mutation
  const createRuleMutation = useMutation({
    mutationFn: createAIRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-rules"] });
      queryClient.invalidateQueries({ queryKey: ["ai-stats"] });
      toast({
        title: t("success"),
        description: t("aiRuleCreated"),
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: t("error"),
        description: t("failedToCreateRule"),
        variant: "destructive",
      });
    },
  });

  // Toggle rule mutation
  const toggleRuleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      updateAIRule(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-rules"] });
      toast({
        title: t("success"),
        description: t("ruleStatusUpdated"),
      });
    },
  });

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: deleteAIRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-rules"] });
      queryClient.invalidateQueries({ queryKey: ["ai-stats"] });
      toast({
        title: t("success"),
        description: t("ruleDeleted"),
      });
    },
  });

  const handleCreateAiRule = () => {
    setIsCreateDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "automation",
      conditions: {
        trigger: "sensor_value",
        operator: "gt",
        value: 0,
      },
      actions: {
        actionType: "control_device",
        command: "OFF",
      },
      priority: 50,
    });
  };

  const handleSubmitRule = () => {
    if (!formData.name.trim()) {
      toast({
        title: t("error"),
        description: t("ruleNameRequired"),
        variant: "destructive",
      });
      return;
    }
    createRuleMutation.mutate(formData);
  };

  const handleToggleRule = (id: number, isActive: boolean) => {
    toggleRuleMutation.mutate({ id, isActive });
  };

  const handleDeleteRule = (id: number) => {
    deleteRuleMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold dark:text-white">
            {t("aiAutomation")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("intelligentAutomation")}
          </p>
        </div>
        <Button onClick={handleCreateAiRule}>
          <Plus className="h-4 w-4" />
          {t("createAiRule")}
        </Button>
      </div>

      {/* Stats Cards */}
      <AIStatsCards stats={stats} isLoading={statsLoading} />

      {/* Tab Navigation */}
      <div
        className="flex gap-2 border-b dark:border-gray-800 overflow-x-auto pb-px -mx-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <Button
          variant={selectedTab === "predictions" ? "default" : "ghost"}
          onClick={() => setSelectedTab("predictions")}
          className="rounded-b-none whitespace-nowrap flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4"
          size="sm"
        >
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">{t("energyPredictions")}</span>
          <span className="xs:hidden">{t("predictions")}</span>
        </Button>
        <Button
          variant={selectedTab === "anomalies" ? "default" : "ghost"}
          onClick={() => setSelectedTab("anomalies")}
          className="rounded-b-none whitespace-nowrap flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4"
          size="sm"
        >
          <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">{t("anomalyDetection")}</span>
          <span className="xs:hidden">{t("anomalies")}</span>
        </Button>
        <Button
          variant={selectedTab === "rules" ? "default" : "ghost"}
          onClick={() => setSelectedTab("rules")}
          className="rounded-b-none whitespace-nowrap flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4"
          size="sm"
        >
          <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">{t("aiRules")}</span>
          <span className="xs:hidden">{t("rules")}</span>
        </Button>
        <Button
          variant={selectedTab === "models" ? "default" : "ghost"}
          onClick={() => setSelectedTab("models")}
          className="rounded-b-none whitespace-nowrap flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4"
          size="sm"
        >
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">{t("aiModels")}</span>
          <span className="xs:hidden">{t("models")}</span>
        </Button>
        <Button
          variant={selectedTab === "homeModels" ? "default" : "ghost"}
          onClick={() => setSelectedTab("homeModels")}
          className="rounded-b-none whitespace-nowrap flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4"
          size="sm"
        >
          <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">{t("homeAIModels")}</span>
          <span className="xs:hidden">{t("homeModels")}</span>
        </Button>
      </div>

      {/* Content Area */}
      {selectedTab === "predictions" && (
        <PredictionsTab
          predictions={predictions}
          isLoading={predictionsLoading}
        />
      )}

      {selectedTab === "anomalies" && (
        <AnomaliesTab anomalies={anomalies} isLoading={anomaliesLoading} />
      )}

      {selectedTab === "rules" && (
        <RulesTab
          rules={rules}
          isLoading={rulesLoading}
          onCreateRule={handleCreateAiRule}
          onToggleRule={handleToggleRule}
          onDeleteRule={handleDeleteRule}
        />
      )}

      {selectedTab === "models" && <ModelsTab />}

      {selectedTab === "homeModels" && <HomeModelsTab />}

      {/* Create AI Rule Dialog */}
      <CreateRuleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmitRule}
        isSubmitting={createRuleMutation.isPending}
      />
    </div>
  );
}
