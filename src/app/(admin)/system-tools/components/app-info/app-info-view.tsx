"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

import { AppInfoGroupCard, type AppInfo } from "./app-info-group-card";
import {
  AppInfoFormDialog,
  type AppInfoFormData,
} from "./app-info-form-dialog";

const INITIAL_FORM: AppInfoFormData = {
  key: "",
  value: "",
  category: "general",
  displayOrder: 0,
  isPublic: true,
};

export function AppInfoView() {
  const { t } = useTranslation();
  const [appInfo, setAppInfo] = useState<AppInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<AppInfo | null>(null);
  const [formData, setFormData] = useState<AppInfoFormData>(INITIAL_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAppInfo();
  }, []);

  // ── Topbar events ─────────────────────────────────────────
  useEffect(() => {
    const onSearch = () => {
      const input =
        searchRef.current?.querySelector("input") ??
        (document.querySelector("input") as HTMLInputElement | null);
      input?.focus();
      input?.select();
    };
    window.addEventListener("topbar-search", onSearch);
    window.addEventListener("topbar-add", handleOpenAdd);
    return () => {
      window.removeEventListener("topbar-search", onSearch);
      window.removeEventListener("topbar-add", handleOpenAdd);
    };
  }, []);

  async function loadAppInfo() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/app-info/admin");
      const data = await res.json();
      if (res.ok) setAppInfo(data.data.appInfo);
    } catch {
      toast.error(t("failedLoadAppInfo"));
    } finally {
      setIsLoading(false);
    }
  }

  function handleOpenAdd() {
    setEditingInfo(null);
    setFormData(INITIAL_FORM);
    setDialogOpen(true);
  }

  function handleOpenEdit(info: AppInfo) {
    setEditingInfo(info);
    setFormData({
      key: info.key,
      value: info.value,
      category: info.category,
      displayOrder: info.displayOrder,
      isPublic: info.isPublic,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    try {
      const url = editingInfo
        ? `/api/v1/app-info/admin/${editingInfo.key}`
        : "/api/v1/app-info/admin";
      const method = editingInfo ? "PATCH" : "POST";
      const body = editingInfo
        ? {
            value: formData.value,
            category: formData.category,
            displayOrder: formData.displayOrder,
            isPublic: formData.isPublic,
          }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingInfo ? t("appInfoUpdated") : t("appInfoCreated"));
        setDialogOpen(false);
        loadAppInfo();
      } else {
        const data = await res.json();
        toast.error(data.error || t("failedSaveAppInfo"));
      }
    } catch {
      toast.error(t("failedSaveAppInfo"));
    }
  }

  async function handleDelete(key: string) {
    if (!confirm(t("deleteAppInfoConfirm"))) return;
    try {
      const res = await fetch(`/api/v1/app-info/admin/${key}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(t("appInfoDeleted"));
        loadAppInfo();
      } else toast.error(t("failedDeleteAppInfo"));
    } catch {
      toast.error(t("failedDeleteAppInfo"));
    }
  }

  // ── Derived data ──────────────────────────────────────────
  const grouped = appInfo
    .filter((info) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        info.key.toLowerCase().includes(q) ||
        info.value.toLowerCase().includes(q) ||
        info.category.toLowerCase().includes(q)
      );
    })
    .reduce<Record<string, AppInfo[]>>((acc, info) => {
      (acc[info.category] ??= []).push(info);
      return acc;
    }, {});

  return (
    <div className="space-y-6">
      {/* Search + Add */}
      <div ref={searchRef} className="flex gap-3">
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchAppInfo")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>
        <Button onClick={handleOpenAdd} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          {t("addInfo")}
        </Button>
      </div>

      {/* Groups */}
      {Object.entries(grouped).map(([category, items]) => (
        <AppInfoGroupCard
          key={category}
          category={category}
          items={items}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      ))}

      {/* Empty state */}
      {!isLoading && Object.keys(grouped).length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? t("noAppInfoMatchSearch") : t("noAppInfoFound")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("getStartedAppInfo")}
            </p>
            {!searchQuery && (
              <Button onClick={handleOpenAdd}>
                <Plus className="h-4 w-4 mr-2" />
                {t("addInfo")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <AppInfoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isEditing={!!editingInfo}
        formData={formData}
        onChange={setFormData}
        onSave={handleSave}
      />
    </div>
  );
}
