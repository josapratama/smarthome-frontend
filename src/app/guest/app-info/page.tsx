"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Info, Shield, Mail, Globe } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";

interface AppInfo {
  appName: string;
  version: string;
  description: string;
  supportEmail: string;
  website: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

export default function GuestAppInfoPage() {
  const { t } = useLanguage();
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppInfo();
  }, []);

  const loadAppInfo = async () => {
    try {
      const res = await fetch("/api/admin/app-info");
      if (res.ok) {
        const data = await res.json();
        setAppInfo(data.data);
      }
    } catch (error: any) {
      toast.error(error.message || t("failedLoadAppInfo"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("appInformation")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("aboutThisApplication")}
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Eye className="h-3 w-3" />
          {t("guest")}
        </Badge>
      </div>

      {appInfo ? (
        <div className="space-y-4">
          {/* Main Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">SH</span>
                </div>
                <div>
                  <CardTitle className="text-2xl">{appInfo.appName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("version")} {appInfo.version}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{appInfo.description}</p>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t("contactInformation")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t("supportEmail")}:</span>
                <a
                  href={`mailto:${appInfo.supportEmail}`}
                  className="text-sm text-primary hover:underline"
                >
                  {appInfo.supportEmail}
                </a>
              </div>
              {appInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t("website")}:</span>
                  <a
                    href={appInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {appInfo.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legal Links */}
          {(appInfo.privacyPolicyUrl || appInfo.termsOfServiceUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t("legalInformation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {appInfo.privacyPolicyUrl && (
                  <a
                    href={appInfo.privacyPolicyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline"
                  >
                    {t("privacyPolicy")}
                  </a>
                )}
                {appInfo.termsOfServiceUrl && (
                  <a
                    href={appInfo.termsOfServiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary hover:underline"
                  >
                    {t("termsOfService")}
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Guest Info */}
          <Card className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                    {t("guestModeActive")}
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    {t("guestModeDesc")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("noAppInfoAvailable")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("contactAdminForInfo")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
