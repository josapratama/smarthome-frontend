"use client";

import { useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    // Log error to error reporting service
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="max-w-lg p-8">
        <div className="space-y-6">
          {/* Error Icon & Title */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("somethingWentWrong")}</h1>
              <p className="mt-2 text-muted-foreground">{t("errorOccurred")}</p>
            </div>
          </div>

          {/* Error Details */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("errorDetails")}:</p>
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-md border bg-muted p-3 text-xs">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-xs text-muted-foreground">
                {t("errorId")}: {error.digest}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => reset()} className="flex-1 gap-2">
              <RefreshCw className="h-4 w-4" />
              {t("tryAgain")}
            </Button>
            <Button asChild variant="outline" className="flex-1 gap-2">
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                {t("backToDashboard")}
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-center text-xs text-muted-foreground">
            {t("errorPersists")}
          </p>
        </div>
      </Card>
    </div>
  );
}
