"use client";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="max-w-md p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <h1 className="text-xl font-semibold">{t("somethingWentWrong")}</h1>
          </div>

          <pre className="whitespace-pre-wrap rounded-md border bg-muted p-3 text-xs">
            {error.message}
          </pre>

          <Button onClick={() => reset()} className="w-full">
            {t("tryAgain")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
