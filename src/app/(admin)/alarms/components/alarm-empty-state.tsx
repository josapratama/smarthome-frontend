import { Card, CardContent } from "@/components/ui/card";
import { Siren } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface AlarmEmptyStateProps {
  hasSearch: boolean;
  isError?: boolean;
}

export function AlarmEmptyState({ hasSearch, isError }: AlarmEmptyStateProps) {
  const { t } = useTranslation();

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-destructive">
            {t("errorLoadingAlarms")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Siren className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t("noAlarmsFound")}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasSearch
              ? t("noAlarmsMatchSearch")
              : t("securityAlarmsWillAppear")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
