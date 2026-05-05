"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Download, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface DataManagementSectionProps {
  onDownload: () => void;
  isProcessing: boolean;
}

export function DataManagementSection({
  onDownload,
  isProcessing,
}: DataManagementSectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          {t("dataManagement")}
        </CardTitle>
        <CardDescription className="text-sm">
          {t("manageYourData")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onDownload}
          disabled={isProcessing}
        >
          <Download className="h-4 w-4 mr-2" />
          {t("downloadMyData")}
        </Button>

        <div className="p-3 bg-muted/50 rounded-xl">
          <div className="flex gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>{t("downloadDataInfo")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
