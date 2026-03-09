"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Plus, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";
import type { NotificationTemplate } from "./types";
import { SendNotificationDialog } from "./send-notification-dialog";
import { TemplateCard } from "./template-card";
import { EditTemplateDialog } from "./edit-template-dialog";
import { apiFetchBrowser } from "@/lib/api/client/fetch";

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(null);

  const filterSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const handleFilter = () => {
      if (filterSectionRef.current) {
        filterSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        filterSectionRef.current.classList.add(
          "ring-2",
          "ring-primary",
          "ring-offset-2",
        );
        setTimeout(() => {
          filterSectionRef.current?.classList.remove(
            "ring-2",
            "ring-primary",
            "ring-offset-2",
          );
        }, 2000);
      }
    };

    window.addEventListener("topbar-filter", handleFilter);

    return () => {
      window.removeEventListener("topbar-filter", handleFilter);
    };
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

  const stats = {
    total: templates.length,
    active: templates.filter((t) => t.isActive).length,
    inactive: templates.filter((t) => !t.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t("notifications")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("manageNotificationTemplates")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => setIsSendDialogOpen(true)}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Bell className="h-4 w-4 mr-2" />
            {t("sendNotification")}
          </Button>
          <Button
            onClick={() => setIsTemplateDialogOpen(true)}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("createTemplate")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-3">
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {t("totalTemplates")}
                </p>
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {t("active")}
                </p>
                <p className="text-xl sm:text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {t("inactive")}
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {stats.inactive}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div ref={filterSectionRef}>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-300">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
            />
          ))}
        </div>
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
