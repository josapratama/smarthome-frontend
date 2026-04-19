"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Brain, TrendingUp, Settings } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
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
} from "@/lib/api/services/ai";

import { AIStatsCards } from "./ai-stats-cards";
import { PredictionsTab } from "./predictions-tab";
import { AnomaliesTab } from "./anomalies-tab";
import { RulesTab } from "./rules-tab";
import { ModelsTab } from "./models-tab";
import { HomeModelsTab } from "./home-models-tab";
import { TrainingSettingsTab } from "./training-settings-tab";
import { TrainingControlTab } from "./training-control-tab";
import { TrainingHistoryTab } from "./training-history-tab";
import { TrainingAnalyticsTab } from "./training-analytics-tab";
import { CreateRuleDialog } from "./create-rule-dialog";
import type { AITab, CreateRuleFormData } from "../types";

const INITIAL_FORM: CreateRuleFormData = {
  name: "",
  description: "",
  type: "automation",
  conditions: { trigger: "sensor_value", operator: "gt", value: 0 },
  actions: { actionType: "control_device", command: "OFF" },
  priority: 50,
};

export function AIView() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedTab, setSelectedTab] = useState<AITab>("predictions");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateRuleFormData>(INITIAL_FORM);

  // ── Topbar refresh ────────────────────────────────────────
  useEffect(() => {
    const onRefresh = () => {
      queryClient.invalidateQueries({ queryKey: ["ai-stats"] });
      queryClient.invalidateQueries({ queryKey: ["energy-predictions"] });
      queryClient.invalidateQueries({ queryKey: ["ai-anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["ai-rules"] });
    };
    window.addEventListener("topbar-refresh", onRefresh);
    return () => window.removeEventListener("topbar-refresh", onRefresh);
  }, [queryClient]);

  // ── Queries ───────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading } = useQuery<AIStats>({
    queryKey: ["ai-stats"],
    queryFn: getAIStats,
  });

  const { data: predictions, isLoading: predictionsLoading } = useQuery<
    EnergyPrediction[]
  >({
    queryKey: ["energy-predictions"],
    queryFn: () => getEnergyPredictions({ limit: 10 }),
  });

  const { data: anomalies, isLoading: anomaliesLoading } = useQuery<Anomaly[]>({
    queryKey: ["ai-anomalies"],
    queryFn: () => getAnomalies({ status: "ALL", limit: 20 }),
  });

  const { data: rules, isLoading: rulesLoading } = useQuery<AIRule[]>({
    queryKey: ["ai-rules"],
    queryFn: () => getAIRules({ type: "all", isActive: "all" }),
  });

  // ── Mutations ─────────────────────────────────────────────
  const createRuleMutation = useMutation({
    mutationFn: createAIRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-rules"] });
      queryClient.invalidateQueries({ queryKey: ["ai-stats"] });
      toast({ title: t("success"), description: t("aiRuleCreated") });
      setIsCreateDialogOpen(false);
      setFormData(INITIAL_FORM);
    },
    onError: () =>
      toast({
        title: t("error"),
        description: t("failedToCreateRule"),
        variant: "destructive",
      }),
  });

  const toggleRuleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      updateAIRule(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-rules"] });
      toast({ title: t("success"), description: t("ruleStatusUpdated") });
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: deleteAIRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-rules"] });
      queryClient.invalidateQueries({ queryKey: ["ai-stats"] });
      toast({ title: t("success"), description: t("ruleDeleted") });
    },
  });

  // ── Handlers ──────────────────────────────────────────────
  function handleSubmitRule() {
    if (!formData.name.trim()) {
      toast({
        title: t("error"),
        description: t("ruleNameRequired"),
        variant: "destructive",
      });
      return;
    }
    createRuleMutation.mutate(formData);
  }

  return (
    <div className="space-y-6">
      <AIStatsCards stats={stats} isLoading={statsLoading} />

      <Tabs
        value={selectedTab}
        onValueChange={(v) => setSelectedTab(v as AITab)}
      >
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="predictions" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">{t("predictions")}</span>
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">{t("anomalies")}</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{t("rules")}</span>
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{t("models")}</span>
          </TabsTrigger>
          <TabsTrigger value="homeModels" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{t("homeModels")}</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">{t("training")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <PredictionsTab
            predictions={predictions}
            isLoading={predictionsLoading}
          />
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <AnomaliesTab anomalies={anomalies} isLoading={anomaliesLoading} />
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <RulesTab
            rules={rules}
            isLoading={rulesLoading}
            onCreateRule={() => setIsCreateDialogOpen(true)}
            onToggleRule={(id, isActive) =>
              toggleRuleMutation.mutate({ id, isActive })
            }
            onDeleteRule={(id) => deleteRuleMutation.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <ModelsTab />
        </TabsContent>

        <TabsContent value="homeModels" className="space-y-4">
          <HomeModelsTab />
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="settings" className="gap-1 px-2">
                <Settings className="h-4 w-4" />
                <span className="hidden lg:inline text-xs">
                  {t("settings")}
                </span>
              </TabsTrigger>
              <TabsTrigger value="control" className="gap-1 px-2">
                <Brain className="h-4 w-4" />
                <span className="hidden lg:inline text-xs">{t("control")}</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1 px-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden lg:inline text-xs">{t("history")}</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-1 px-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden lg:inline text-xs">
                  {t("analytics")}
                </span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="space-y-4">
              <TrainingSettingsTab />
            </TabsContent>
            <TabsContent value="control" className="space-y-4">
              <TrainingControlTab />
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <TrainingHistoryTab />
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <TrainingAnalyticsTab />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

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
