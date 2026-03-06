"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, MapPin, Users, ArrowLeft, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface PublicHome {
  id: number;
  name: string;
  addressText?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  memberCount?: number;
  deviceCount?: number;
}

export default function PublicHomesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [homes, setHomes] = useState<PublicHome[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicHomes();
  }, []);

  const fetchPublicHomes = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/v1/public/homes");
      const result = await response.json();

      if (result.success && result.data) {
        setHomes(result.data);
      } else {
        setHomes([]);
      }
    } catch (error) {
      console.error("Failed to fetch public homes:", error);
      setHomes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToHome")}
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t("publicHomesTitle")}</h1>
              <p className="text-muted-foreground">
                {t("publicHomesDescription")}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : homes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {t("noPublicHomes")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("noPublicHomesDescription") ||
                  "Public homes will appear here when available"}
              </p>
              <Button onClick={() => router.push("/login")}>
                {t("login")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homes.map((home) => (
              <Card key={home.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    {home.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(home.addressText || home.city) && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        {home.addressText && <div>{home.addressText}</div>}
                        {home.city && (
                          <div className="text-muted-foreground">
                            {home.city}
                            {home.postalCode && ` ${home.postalCode}`}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {home.memberCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {home.memberCount} {t("members")}
                        </span>
                      </div>
                    )}
                    {home.deviceCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <Home className="h-4 w-4" />
                        <span>
                          {home.deviceCount} {t("devices")}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
