"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Plus, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";
import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        stats={[
          {
            label: t("totalTemplates"),
            value: stats.total,
            icon: Bell,
            color: "text-blue-500",
          },
          {
            label: t("active"),
            value: stats.active,
            icon: CheckCircle,
            color: "text-green-500",
          },
          {
            label: t("inactive"),
            value: stats.inactive,
            icon: XCircle,
            color: "text-orange-500",
          },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              onClick={() => setIsSendDialogOpen(true)}
              variant="outline"
              size="sm"
            >
              <Bell className="h-4 w-4 mr-2" />
              {t("sendNotification")}
            </Button>
            <Button onClick={() => setIsTemplateDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t("createTemplate")}
            </Button>
          </div>
        }
      />

      <div ref={filterSectionRef}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 transition-all duration-300">
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
