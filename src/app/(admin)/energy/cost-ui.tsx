"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import {
  DollarSign,
  Save,
  Edit,
  Globe,
  Home,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import {
  getEnergyCost,
  setGlobalEnergyCost,
  type EnergyCostSettings,
} from "@/lib/api/services/energy-cost";
import { homesApi } from "@/lib/api/services/homes";

interface HomeWithCost {
  id: number;
  name: string;
  costSettings: EnergyCostSettings | null;
  isCustom: boolean;
}

export default function EnergyCostUI() {
  const { t } = useTranslation();
  const [globalCost, setGlobalCost] = useState<EnergyCostSettings | null>(null);
  const [homesWithCost, setHomesWithCost] = useState<HomeWithCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [costPerKwh, setCostPerKwh] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const globalSettings = await getEnergyCost();
      setGlobalCost(globalSettings);
      setCostPerKwh(globalSettings.costPerKwh.toString());

      const homes = await homesApi.list();

      const homesWithCostData = await Promise.all(
        homes.map(async (home) => {
          try {
            const costSettings = await getEnergyCost(home.id);
            return {
              id: home.id,
              name: home.name,
              costSettings,
              isCustom: costSettings.homeId !== null,
            };
          } catch (error) {
            return {
              id: home.id,
              name: home.name,
              costSettings: null,
              isCustom: false,
            };
          }
        }),
      );

      setHomesWithCost(homesWithCostData);
    } catch (error: any) {
      console.error("Failed to load energy cost data:", error);
      toast.error(error.message || t("errorLoadingData"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGlobal = async () => {
    const cost = parseFloat(costPerKwh);
    if (isNaN(cost) || cost <= 0) {
      toast.error(t("invalidCostValue"));
      return;
    }

    setIsSaving(true);
    try {
      await setGlobalEnergyCost({ costPerKwh: cost });
      toast.success(t("globalEnergyCostUpdated"));
      setIsEditing(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || t("failedUpdateEnergyCost"));
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const customHomesCount = homesWithCost.filter((h) => h.isCustom).length;
  const globalHomesCount = homesWithCost.length - customHomesCount;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("totalHomes")}
                </p>
                <p className="text-2xl font-bold">{homesWithCost.length}</p>
              </div>
              <Home className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("usingGlobalRate")}
                </p>
                <p className="text-2xl font-bold">{globalHomesCount}</p>
              </div>
              <Globe className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("customRates")}
                </p>
                <p className="text-2xl font-bold">{customHomesCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Energy Cost Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              {t("globalDefaultRate")}
            </span>
            <Badge className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {t("default")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-32 rounded-lg" />
          ) : !isEditing ? (
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("currentGlobalRate")}
                  </p>
                  <p className="text-4xl font-bold">
                    {globalCost ? formatCurrency(globalCost.costPerKwh) : "-"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("perKilowattHour")}
                  </p>
                  {globalCost?.updatedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {t("lastUpdated")}:{" "}
                      {new Date(globalCost.updatedAt).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t("edit")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("newGlobalRate")} (IDR)
                </label>
                <Input
                  type="number"
                  value={costPerKwh}
                  onChange={(e) => setCostPerKwh(e.target.value)}
                  placeholder="1500"
                  min="0"
                  step="100"
                />
                <p className="text-xs text-muted-foreground">
                  {t("globalRateHint")}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveGlobal} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? t("saving") : t("saveChanges")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setCostPerKwh(globalCost?.costPerKwh.toString() || "1500");
                  }}
                  disabled={isSaving}
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <DollarSign className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">{t("aboutGlobalEnergyCost")}</p>
              <p className="text-blue-700 dark:text-blue-300">
                {t("globalEnergyCostDescription")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Homes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            {t("homesEnergyCostOverview")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : homesWithCost.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t("noHomesFound")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {homesWithCost.map((home) => (
                <div
                  key={home.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{home.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ID: {home.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {home.costSettings
                          ? formatCurrency(home.costSettings.costPerKwh)
                          : "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("perKwh")}
                      </p>
                    </div>
                    {home.isCustom ? (
                      <Badge className="flex items-center gap-1">
                        <Home className="h-3 w-3" />
                        {t("homeSpecific")}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        {t("globalDefault")}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
