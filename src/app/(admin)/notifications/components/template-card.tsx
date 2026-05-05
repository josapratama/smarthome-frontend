"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Edit, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { NotificationTemplate } from "../types";

interface TemplateCardProps {
  template: NotificationTemplate;
  onEdit: (template: NotificationTemplate) => void;
  onDelete: (type: string) => void;
}

function getChannelIcon(channel: string) {
  return channel === "EMAIL" ? (
    <Mail className="h-4 w-4" />
  ) : (
    <Bell className="h-4 w-4" />
  );
}

function getTypeLabel(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function TemplateCard({
  template,
  onEdit,
  onDelete,
}: TemplateCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {getChannelIcon(template.channel)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg truncate">
                {getTypeLabel(template.type)}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {template.channel}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={template.isActive ? "default" : "secondary"}
            className="shrink-0"
          >
            {template.isActive ? t("active") : t("inactive")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-0">
        <div className="space-y-2 text-xs sm:text-sm flex-1 mb-4">
          {template.channel === "EMAIL" && (
            <>
              <div className="p-2 rounded-lg bg-muted/50">
                <span className="font-medium text-muted-foreground">
                  {t("subject")}:
                </span>{" "}
                <span className="line-clamp-1">{template.emailSubject}</span>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <span className="font-medium text-muted-foreground">
                  {t("body")}:
                </span>{" "}
                <span className="text-muted-foreground line-clamp-2">
                  {template.emailBody?.replace(/<[^>]*>/g, "")}
                </span>
              </div>
            </>
          )}
          {template.channel === "FCM" && (
            <>
              <div className="p-2 rounded-lg bg-muted/50">
                <span className="font-medium text-muted-foreground">
                  {t("title")}:
                </span>{" "}
                <span className="line-clamp-1">{template.pushTitle}</span>
              </div>
              <div className="p-2 rounded-lg bg-muted/50">
                <span className="font-medium text-muted-foreground">
                  {t("body")}:
                </span>{" "}
                <span className="text-muted-foreground line-clamp-2">
                  {template.pushBody}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(template)}
          >
            <Edit className="h-3 w-3 sm:mr-1" />
            <span className="hidden sm:inline">{t("edit")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete(template.type)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
