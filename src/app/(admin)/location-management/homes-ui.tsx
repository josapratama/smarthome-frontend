"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type {
  HomeDTO,
  HomesListResponse,
  HomeCreateRequest,
} from "@/lib/api/dto/homes.dto";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/page-header";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Home as HomeIcon, Users, DoorOpen, Search } from "lucide-react";

function fmtDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

interface CreateHomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CreateHomeDialog({ open, onOpenChange }: CreateHomeDialogProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<HomeCreateRequest>({
    name: "",
    ownerUserId: 1,
    addressText: "",
    city: "",
    postalCode: "",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: HomeCreateRequest) => {
      return apiFetchBrowser("/api/v1/homes", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.homes.list() });
      onOpenChange(false);
      setFormData({
        name: "",
        ownerUserId: 1,
        addressText: "",
        city: "",
        postalCode: "",
      });
      toast({ title: t("homeCreatedSuccessfully") });
    },
    onError: (error: any) => {
      toast({
        title: t("failedToCreateHome"),
        description: error.message || t("unknownError"),
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createNewHome")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">{t("name")} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev: HomeCreateRequest) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder={t("homeName")}
            />
          </div>
          <div>
            <Label htmlFor="addressText">{t("address")}</Label>
            <Input
              id="addressText"
              value={formData.addressText}
              onChange={(e) =>
                setFormData((prev: HomeCreateRequest) => ({
                  ...prev,
                  addressText: e.target.value,
                }))
              }
              placeholder={t("fullAddress")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">{t("city")}</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev: HomeCreateRequest) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
                placeholder={t("city")}
              />
            </div>
            <div>
              <Label htmlFor="postalCode">{t("postalCode")}</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData((prev: HomeCreateRequest) => ({
                    ...prev,
                    postalCode: e.target.value,
                  }))
                }
                placeholder={t("postalCode")}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.name || createMutation.isPending}
            >
              {createMutation.isPending ? t("creating") : t("create")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function HomesClient() {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const q = useQuery({
    queryKey: qk.homes.list(),
    queryFn: async () => {
      const payload = await apiFetchBrowser<HomesListResponse>("/api/v1/homes");
      return payload.data ?? [];
    },
  });

  const filtered = (q.data ?? []).filter((home: HomeDTO) => {
    const search = searchText.toLowerCase();
    return (
      home.name.toLowerCase().includes(search) ||
      (home.city ?? "").toLowerCase().includes(search) ||
      String(home.id).includes(search)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <PageHeader
        stats={[
          {
            label: t("totalHomes"),
            value: filtered.length,
            icon: HomeIcon,
            color: "text-blue-500",
          },
        ]}
      />

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div ref={searchSectionRef} className="flex-1">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder={t("searchHomes")}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Home Button */}
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="shadow-md hover:shadow-lg transition-all"
        >
          <HomeIcon className="h-4 w-4 mr-2" />
          {t("addHome")}
        </Button>
      </div>

      <CreateHomeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("homesList")}</CardTitle>
        </CardHeader>

        <CardContent>
          {q.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : q.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {(q.error as Error).message}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {searchText ? t("noHomesMatchSearch") : t("noHomesFound")}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((home: HomeDTO) => (
                <Card
                  key={home.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <HomeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">
                            {home.name}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            ID: #{home.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Address Info */}
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {home.addressText || t("noAddress")}
                      </p>
                      {(home.city || home.postalCode) && (
                        <p className="text-xs text-muted-foreground">
                          {home.city}
                          {home.city && home.postalCode && " • "}
                          {home.postalCode}
                        </p>
                      )}
                    </div>

                    {/* Owner Badge */}
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">
                        {t("owner")}: {home.ownerUserId}
                      </Badge>
                    </div>

                    {/* Timestamps */}
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div>
                        {t("created")}: {fmtDateTime(home.createdAt)}
                      </div>
                      <div>
                        {t("updated")}: {fmtDateTime(home.updatedAt)}
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Link
                        href={`/location-management/homes/${home.id}/rooms`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <DoorOpen className="h-3 w-3 mr-1" />
                          {t("rooms")}
                        </Button>
                      </Link>
                      <Link
                        href={`/device-management?homeId=${home.id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          {t("devices")}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {q.isFetching && !q.isLoading ? (
            <div className="mt-3 text-xs text-muted-foreground">
              {t("updating")}…
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
