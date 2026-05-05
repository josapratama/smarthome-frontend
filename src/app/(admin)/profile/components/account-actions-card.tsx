import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface AccountActionsCardProps {
  onLogout: () => void;
}

export function AccountActionsCard({ onLogout }: AccountActionsCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("accountActions")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {t("logout")}
        </Button>
      </CardContent>
    </Card>
  );
}
