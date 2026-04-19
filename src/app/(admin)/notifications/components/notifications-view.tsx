"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { NotificationTemplate } from "../types";

import { NotificationStats } from "./notification-stats";
import { TemplateCard } from "./template-card";
import { TemplateEmptyState } from "./template-empty-state";
import { EditTemplateDialog } from "./edit-template-dialog";
import { SendNotificationDialog } from "./send-notification-dialog";

export function NotificationsView() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  // ── Topbar filter ─────────────────────────────────────────
  useEffect(() => {
    const onFilter = () => {
      filterRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      filterRef.current?.classList.add(
        "ring-2",
        "ring-primary",
        "ring-offset-2",
      );
      setTimeout(
        () =>
          filterRef.current?.classList.remove(
            "ring-2",
            "ring-primary",
            "ring-offset-2",
          ),
        2000,
      );
    };
    window.addEventListener("topbar-filter", onFilter);
    return () => window.removeEventListener("topbar-filter", onFilter);
  }, []);

  async function loadTemplates() {
    setIsLoading(true);
    try {
      const data = await apiFetchBrowser<{
        data: { templates: NotificationTemplate[] };
      }>("/api/v1/notifications/templates");
      setTemplates(data.data.templates);
    } catch {
      toast.error(t("failedLoadNotifications"));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(type: string) {
    if (!confirm(t("deleteTemplateConfirm"))) return;
    try {
      await apiFetchBrowser(`/api/v1/notifications/templates/${type}`, {
        method: "DELETE",
      });
      toast.success(t("templateDeleted"));
      loadTemplates();
    } catch {
      toast.error(t("failedDeleteTemplate"));
    }
  }

  function handleEdit(template: NotificationTemplate) {
    setSelectedTemplate(template);
    setIsEditOpen(true);
  }

  function handleEditSuccess() {
    setIsEditOpen(false);
    setSelectedTemplate(null);
    loadTemplates();
  }

  const stats = {
    total: templates.length,
    active: templates.filter((t) => t.isActive).length,
    inactive: templates.filter((t) => !t.isActive).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            variant="outline"
            size="sm"
            onClick={() => setIsSendOpen(true)}
          >
            <Bell className="h-4 w-4 mr-2" />
            {t("sendNotification")}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setSelectedTemplate(null);
              setIsEditOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("createTemplate")}
          </Button>
        </div>
      </div>

      <NotificationStats {...stats} />

      {/* Template grid */}
      <div ref={filterRef}>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-300">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {templates.length === 0 && !isLoading && (
        <TemplateEmptyState
          onCreateTemplate={() => {
            setSelectedTemplate(null);
            setIsEditOpen(true);
          }}
        />
      )}

      <EditTemplateDialog
        template={selectedTemplate}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={handleEditSuccess}
      />

      <SendNotificationDialog open={isSendOpen} onOpenChange={setIsSendOpen} />
    </div>
  );
}
