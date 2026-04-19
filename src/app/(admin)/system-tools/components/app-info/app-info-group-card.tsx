import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export interface AppInfo {
  id: number;
  key: string;
  value: string;
  category: string;
  displayOrder: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AppInfoGroupCardProps {
  category: string;
  items: AppInfo[];
  onEdit: (info: AppInfo) => void;
  onDelete: (key: string) => void;
}

export function AppInfoGroupCard({
  category,
  items,
  onEdit,
  onDelete,
}: AppInfoGroupCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{category}</CardTitle>
        <CardDescription>
          {items.length} {t("item")}
          {items.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((info) => (
            <div
              key={info.id}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {info.key}
                  </code>
                  <Badge variant={info.isPublic ? "default" : "secondary"}>
                    {info.isPublic ? t("public") : t("private")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {info.value}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(info)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(info.key)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
