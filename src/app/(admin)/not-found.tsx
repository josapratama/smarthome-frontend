"use client";

import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="max-w-lg p-8">
        <div className="space-y-6">
          {/* 404 Icon & Title */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <FileQuestion className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">404</h1>
              <h2 className="mt-2 text-2xl font-semibold">
                {t("pageNotFound")}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {t("pageNotFoundDesc")}
              </p>
            </div>
          </div>

          {/* Suggestions */}
          <div className="rounded-md border bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium">{t("suggestions")}:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• {t("checkUrlSpelling")}</li>
              <li>• {t("pageMovedOrDeleted")}</li>
              <li>• {t("useNavigationMenu")}</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("goBack")}
            </Button>
            <Button asChild className="flex-1 gap-2">
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                {t("backToDashboard")}
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
