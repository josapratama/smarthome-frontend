"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Home } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import {
  adminGetTariffs,
  adminSetTariff,
  adminGetHomeTariffs,
  adminSetHomeTariff,
  adminDeleteHomeTariff,
  type PLNTariff,
  type HomeTariff,
} from "@/lib/api/services/energy-cost";

import { CostStats } from "./cost-stats";
import { TariffTable } from "./tariff-table";
import { HomeTariffRow } from "./home-tariff-row";
import { CostInfoCard } from "./cost-info-card";

export function CostView() {
  const { t } = useTranslation();
  const [tariffs, setTariffs] = useState<PLNTariff[]>([]);
  const [homeTariffs, setHomeTariffs] = useState<HomeTariff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [t, h] = await Promise.all([
        adminGetTariffs(),
        adminGetHomeTariffs(),
      ]);
      setTariffs(t);
      setHomeTariffs(h);
    } catch (err: any) {
      toast.error(err.message || t("failedLoadTariffData"));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveTariff(key: string, tarif: number) {
    const updated = await adminSetTariff(key, tarif);
    setTariffs(updated);
    toast.success(t("tariffUpdated"));
  }

  async function handleSaveHomeTariff(homeId: number, tariffKey: string) {
    await adminSetHomeTariff(homeId, tariffKey);
    setHomeTariffs(await adminGetHomeTariffs());
    toast.success(t("homeTariffUpdated"));
  }

  async function handleResetHomeTariff(homeId: number) {
    await adminDeleteHomeTariff(homeId);
    setHomeTariffs(await adminGetHomeTariffs());
    toast.success(t("homeTariffReset"));
  }

  return (
    <div className="space-y-6">
      <CostStats tariffs={tariffs} homeTariffs={homeTariffs} />

      {/* Tariff management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            {t("manageTariffPerGolongan")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("manageTariffDesc")}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : (
            <TariffTable tariffs={tariffs} onSave={handleSaveTariff} />
          )}
        </CardContent>
      </Card>

      {/* Home tariff assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            {t("golonganTariffPerHome")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("golonganTariffPerHomeDesc")}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : homeTariffs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>{t("noHomesRegistered")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {homeTariffs.map((home) => (
                <HomeTariffRow
                  key={home.homeId}
                  home={home}
                  tariffs={tariffs}
                  onSave={handleSaveHomeTariff}
                  onReset={handleResetHomeTariff}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CostInfoCard />
    </div>
  );
}
