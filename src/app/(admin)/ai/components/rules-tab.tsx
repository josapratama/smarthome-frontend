import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Settings, Power, PowerOff, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { AIRule } from "@/lib/api/services/ai";
import { getRuleTypeColor, getActiveStatusColor } from "../utils";

interface RulesTabProps {
  rules: AIRule[] | undefined;
  isLoading: boolean;
  onCreateRule: () => void;
  onToggleRule: (id: number, isActive: boolean) => void;
  onDeleteRule: (id: number) => void;
}

export function RulesTab({
  rules,
  isLoading,
  onCreateRule,
  onToggleRule,
  onDeleteRule,
}: RulesTabProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl shadow-sm border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle className="text-base dark:text-white">
          {t("aiRules")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : !rules || rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Settings className="h-10 w-10 text-muted-foreground/50" />
            <h3 className="mt-3 text-sm font-semibold dark:text-white">
              {t("noRulesCreated")}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("createFirstRule")}
            </p>
            <Button className="mt-4" size="sm" onClick={onCreateRule}>
              <Plus className="h-4 w-4" />
              {t("createAiRule")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm dark:text-white">
                      {rule.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getRuleTypeColor(rule.type)}`}
                    >
                      {rule.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getActiveStatusColor(rule.isActive)}`}
                    >
                      {rule.isActive ? t("active") : t("inactive")}
                    </Badge>
                  </div>
                  {rule.description && (
                    <div className="text-sm text-muted-foreground mb-1">
                      {rule.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {t("priority")}: {rule.priority} • {t("executed")}:{" "}
                    {rule.executionCount} {t("times")}
                    {rule.lastExecutedAt && (
                      <>
                        {" "}
                        • {t("lastRun")}:{" "}
                        {new Date(rule.lastExecutedAt).toLocaleString()}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onToggleRule(rule.id, !rule.isActive)}
                  >
                    {rule.isActive ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
