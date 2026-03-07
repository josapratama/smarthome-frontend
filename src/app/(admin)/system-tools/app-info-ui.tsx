"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Info,
  Edit,
  Trash2,
  Plus,
  Save,
  FileText,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";

interface AppInfo {
  id: number;
  key: string;
  value: string;
  category: string;
  displayOrder: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AppInfoUI() {
  const { t } = useLanguage();
  const [appInfo, setAppInfo] = useState<AppInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<AppInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const searchSectionRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    key: "",
    value: "",
    category: "general",
    displayOrder: 0,
    isPublic: true,
  });

  useEffect(() => {
    loadAppInfo();
  }, []);

  useEffect(() => {
    const handleSearch = () => {
      let searchInput: HTMLInputElement | null = null;
      if (searchSectionRef.current) {
        searchInput = searchSectionRef.current.querySelector(
          "input",
        ) as HTMLInputElement;
      }
      if (!searchInput) {
        searchInput = document.querySelector("input") as HTMLInputElement;
      }
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    };

    const handleAdd = () => {
      handleOpenDialog();
    };

    window.addEventListener("topbar-search", handleSearch);
    window.addEventListener("topbar-add", handleAdd);

    return () => {
      window.removeEventListener("topbar-search", handleSearch);
      window.removeEventListener("topbar-add", handleAdd);
    };
  }, []);

  const loadAppInfo = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/app-info/admin");
      const data = await res.json();
      if (res.ok) {
        setAppInfo(data.data.appInfo);
      }
    } catch (error) {
      toast.error(t("failedLoadAppInfo"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (info?: AppInfo) => {
    if (info) {
      setEditingInfo(info);
      setFormData({
        key: info.key,
        value: info.value,
        category: info.category,
        displayOrder: info.displayOrder,
        isPublic: info.isPublic,
      });
    } else {
      setEditingInfo(null);
      setFormData({
        key: "",
        value: "",
        category: "general",
        displayOrder: 0,
        isPublic: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
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
        setIsDialogOpen(false);
        loadAppInfo();
      } else {
        const data = await res.json();
        toast.error(data.error || t("failedSaveAppInfo"));
      }
    } catch (error) {
      toast.error(t("failedSaveAppInfo"));
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(t("deleteAppInfoConfirm"))) return;

    try {
      const res = await fetch(`/api/v1/app-info/admin/${key}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(t("appInfoDeleted"));
        loadAppInfo();
      } else {
        toast.error(t("failedDeleteAppInfo"));
      }
    } catch (error) {
      toast.error(t("failedDeleteAppInfo"));
    }
  };

  const groupedInfo = appInfo
    .filter((info) => {
      if (!searchQuery) return true;
      const search = searchQuery.toLowerCase();
      return (
        info.key.toLowerCase().includes(search) ||
        info.value.toLowerCase().includes(search) ||
        info.category.toLowerCase().includes(search)
      );
    })
    .reduce(
      (acc, info) => {
        if (!acc[info.category]) {
          acc[info.category] = [];
        }
        acc[info.category].push(info);
        return acc;
      },
      {} as Record<string, AppInfo[]>,
    );

  const stats = {
    total: appInfo.length,
    public: appInfo.filter((i) => i.isPublic).length,
    private: appInfo.filter((i) => !i.isPublic).length,
    categories: Object.keys(
      appInfo.reduce(
        (acc, info) => {
          acc[info.category] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      ),
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div ref={searchSectionRef}>
        <Card>
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
      </div>

      {Object.entries(groupedInfo).map(([category, items]) => (
        <Card key={category}>
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
                      {info.isPublic ? (
                        <Badge variant="default">{t("public")}</Badge>
                      ) : (
                        <Badge variant="secondary">{t("private")}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {info.value}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(info)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(info.key)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {Object.keys(groupedInfo).length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? t("noAppInfoMatchSearch") : t("noAppInfoFound")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("getStartedAppInfo")}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingInfo ? t("editAppInfo") : t("addAppInfo")}
            </DialogTitle>
            <DialogDescription>
              {editingInfo ? t("updateAppInfo") : t("addNewAppInfo")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key">{t("key")}</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) =>
                  setFormData({ ...formData, key: e.target.value })
                }
                placeholder={t("keyPlaceholder")}
                disabled={!!editingInfo}
              />
              <p className="text-xs text-muted-foreground">
                {t("keyDescription")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">{t("value")}</Label>
              <Textarea
                id="value"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder={t("enterValue")}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">{t("category")}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{t("general")}</SelectItem>
                    <SelectItem value="about">{t("about")}</SelectItem>
                    <SelectItem value="contact">{t("contact")}</SelectItem>
                    <SelectItem value="legal">{t("legal")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">{t("displayOrder")}</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isPublic" className="cursor-pointer">
                {t("publicVisibility")}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
