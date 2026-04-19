import { Card, CardContent } from "@/components/ui/card";
import { Zap, Home } from "lucide-react";
import { Check } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { PLNTariff, HomeTariff } from "@/lib/api/services/energy-cost";

interface CostStatsProps {
  tariffs: PLNTariff[];
  homeTariffs: HomeTariff[];
}

export function CostStats({ tariffs, homeTariffs }: CostStatsProps) {
  const { t } = useTranslation();
  const setCount = tariffs.filter((t) => t.tarif > 0).length;
  const homeSetCount = homeTariffs.filter((h) => h.selectedTariffKey).length;

  const stats = [
    {
      label: t("totalGolongan"),
      value: tariffs.length,
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      label: t("tariffAlreadySet"),
      value: setCount,
      icon: Check,
      color: "text-green-500",
    },
    {
      label: t("homeAlreadyChooseGolongan"),
      value: `${homeSetCount}/${homeTariffs.length}`,
      icon: Home,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <Card key={label} className="rounded-2xl shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
              <Icon className={`h-8 w-8 ${color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
