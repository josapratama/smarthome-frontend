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
import { useLanguage } from "@/contexts/language-context";
import type { NotificationTemplate } from "./types";

interface TemplateCardProps {
  template: NotificationTemplate;
  onEdit: (template: NotificationTemplate) => void;
  onDelete: (type: string) => void;
}

export function TemplateCard({
  template,
  onEdit,
  onDelete,
}: TemplateCardProps) {
  const { t } = useLanguage();

  const getChannelIcon = (channel: string) => {
    return channel === "EMAIL" ? (
      <Mail className="h-4 w-4" />
    ) : (
      <Bell className="h-4 w-4" />
    );
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getChannelIcon(template.channel)}
            <CardTitle className="text-lg">
              {getTypeLabel(template.type)}
            </CardTitle>
          </div>
          <Badge variant={template.isActive ? "default" : "secondary"}>
            {template.isActive ? t("active") : t("inactive")}
          </Badge>
        </div>
        <CardDescription>
          {t("channel")}: {template.channel}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {template.channel === "EMAIL" && (
            <>
              <div>
                <span className="font-medium">{t("subject")}:</span>{" "}
                {template.emailSubject}
              </div>
              <div>
                <span className="font-medium">{t("body")}:</span>{" "}
                <span className="text-muted-foreground line-clamp-2">
                  {template.emailBody?.replace(/<[^>]*>/g, "")}
                </span>
              </div>
            </>
          )}
          {template.channel === "FCM" && (
            <>
              <div>
                <span className="font-medium">{t("title")}:</span>{" "}
                {template.pushTitle}
              </div>
              <div>
                <span className="font-medium">{t("body")}:</span>{" "}
                {template.pushBody}
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(template)}
          >
            <Edit className="h-3 w-3 mr-1" />
            {t("edit")}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(template.type)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
