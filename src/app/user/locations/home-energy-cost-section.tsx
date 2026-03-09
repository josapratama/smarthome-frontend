"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DollarSign, Globe, Home, Trash2, Save, Edit } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import {
  getEnergyCost,
  setHomeEnergyCost,
  removeHomeEnergyCost,
  type EnergyCostSettings,
} from "@/lib/api/services/energy-cost";

interface HomeEnergyCostSectionProps {
  homeId: number;
  isOwner: boolean;
}

export function HomeEnergyCostSection({
  homeId,
  isOwner,
}: HomeEnergyCostSectionProps) {
  const { t } = useTranslation();
  const [costSettings, setCostSettings] = useState<EnergyCostSettings | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [costPerKwh, setCostPerKwh] = useState("");
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCostSettings();
  }, [homeId]);

  const loadCostSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getEnergyCost(homeId);
      setCostSettings(settings);
      setCostPerKwh(settings.costPerKwh.toString());
    } catch (error) {
      console.error("Failed to load energy cost settings:", error);
      // Set default if API not available
      setCostSettings({
        id: 0,
        homeId: null,
        costPerKwh: 1500,
        currency: "IDR",
        updatedAt: new Date().toISOString(),
        updatedBy: 0,
      });
      setCostPerKwh("1500");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const cost = parseFloat(costPerKwh);
    if (isNaN(cost) || cost <= 0) {
      toast.error(t("invalidCostValue"));
      return;
    }

    setIsSaving(true);
    try {
      await setHomeEnergyCost(homeId, { costPerKwh: cost });
      toast.success(t("energyCostUpdated"));
      setIsEditing(false);
      loadCostSettings();
    } catch (error: any) {
      toast.error(error.message || t("failedUpdateEnergyCost"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeHomeEnergyCost(homeId);
      toast.success(t("energyCostRemoved"));
      setShowRemoveDialog(false);
      loadCostSettings();
    } catch (error: any) {
      toast.error(error.message || t("failedRemoveEnergyCost"));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOwner) {
    return null; // Only show to home owner
  }

  const isUsingGlobal = costSettings?.homeId === null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-green-500" />
          {t("energyCostSettings")}
        </h2>
      </div>

      <p className="text-sm text-muted-foreground">
        {t("manageEnergyCostForHome")}
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              {t("electricityCostRate")}
            </span>
            {isUsingGlobal ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {t("globalDefault")}
              </Badge>
            ) : (
              <Badge className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                {t("homeSpecific")}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Cost Display */}
          {!isEditing ? (
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {t("currentRate")}
                  </p>
                  <p className="text-3xl font-bold">
                    {costSettings
                      ? formatCurrency(costSettings.costPerKwh)
                      : "-"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("perKilowattHour")}
                  </p>
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
            /* Edit Mode */
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("costPerKwh")} (IDR)
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
                  {t("energyCostHint")}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? t("saving") : t("save")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setCostPerKwh(
                      costSettings?.costPerKwh.toString() || "1500",
                    );
                  }}
                  disabled={isSaving}
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          )}

          {/* Remove Home-Specific Cost */}
          {!isUsingGlobal && !isEditing && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowRemoveDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("useGlobalDefault")}
              </Button>
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
              <p className="font-medium mb-1">{t("aboutEnergyCost")}</p>
              <p className="text-blue-700 dark:text-blue-300">
                {t("energyCostDescription")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("useGlobalDefaultConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("useGlobalDefaultDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove}>
              {t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
