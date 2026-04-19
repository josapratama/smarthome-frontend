import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface TemplateEmptyStateProps {
  onCreateTemplate: () => void;
}

export function TemplateEmptyState({
  onCreateTemplate,
}: TemplateEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t("noTemplatesFound")}</h3>
        <p className="text-muted-foreground mb-4">{t("getStartedTemplate")}</p>
        <Button onClick={onCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          {t("createTemplate")}
        </Button>
      </CardContent>
    </Card>
  );
}
