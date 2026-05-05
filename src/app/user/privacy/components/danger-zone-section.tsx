"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface DangerZoneSectionProps {
  onDelete: () => void;
  isProcessing: boolean;
}

export function DangerZoneSection({
  onDelete,
  isProcessing,
}: DangerZoneSectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-card border-destructive/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          {t("dangerZone")}
        </CardTitle>
        <CardDescription className="text-sm">
          {t("irreversibleActions")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={onDelete}
          disabled={isProcessing}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isProcessing ? t("deleting") : t("deleteAllMyData")}
        </Button>

        <div className="p-3 bg-destructive/10 rounded-xl">
          <div className="flex gap-2 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>{t("deleteDataWarning")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
