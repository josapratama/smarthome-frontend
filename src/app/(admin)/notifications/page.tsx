"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";
import type { NotificationTemplate } from "./types";
import { SendNotificationDialog } from "./send-notification-dialog";
import { TemplateCard } from "./template-card";
import { EditTemplateDialog } from "./edit-template-dialog";
import { apiFetchBrowser } from "@/lib/api/client.browser";

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetchBrowser<{
        data: { templates: NotificationTemplate[] };
      }>("/api/v1/notifications/templates");
      setTemplates(data.data.templates);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error(t("failedLoadNotifications"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (type: string) => {
    if (!confirm(t("deleteTemplateConfirm"))) return;

    try {
      await apiFetchBrowser(`/api/v1/notifications/templates/${type}`, {
        method: "DELETE",
      });
      toast.success(t("templateDeleted"));
      loadTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error(t("failedDeleteTemplate"));
    }
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setIsTemplateDialogOpen(true);
  };

  const handleTemplateSuccess = () => {
    setIsTemplateDialogOpen(false);
    setSelectedTemplate(null);
    loadTemplates();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {t("notifications")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("manageNotificationTemplates")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsSendDialogOpen(true)}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Bell className="h-4 w-4 mr-2" />
            <span className="sm:inline">{t("sendNotification")}</span>
          </Button>
          <Button
            onClick={() => setIsTemplateDialogOpen(true)}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="sm:inline">{t("createTemplate")}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
          />
        ))}
      </div>

      {templates.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("noTemplatesFound")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("getStartedTemplate")}
            </p>
            <Button onClick={() => setIsTemplateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("createTemplate")}
            </Button>
          </CardContent>
        </Card>
      )}

      <EditTemplateDialog
        template={selectedTemplate}
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        onSuccess={handleTemplateSuccess}
      />

      <SendNotificationDialog
        open={isSendDialogOpen}
        onOpenChange={setIsSendDialogOpen}
      />
    </div>
  );
}
