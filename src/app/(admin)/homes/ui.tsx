"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import type {
  HomeDTO,
  HomesListResponse,
  HomeCreateRequest,
} from "@/lib/api/dto/homes.dto";
import { useTranslation } from "@/hooks/use-translation";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

function fmtDateTime(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}

function CreateHomeDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<HomeCreateRequest>({
    name: "",
    ownerUserId: 1, // Default, should be current user
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
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t("createHome")}</Button>
      </DialogTrigger>
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
            <Button variant="outline" onClick={() => setOpen(false)}>
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

export function HomesClient() {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("homes")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("manageHomesAndSettings")}
          </p>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={t("searchHomes")}
            className="sm:w-[300px]"
          />
          <Button
            variant="outline"
            onClick={() => q.refetch()}
            disabled={q.isFetching}
          >
            {t("refresh")}
          </Button>
          <CreateHomeDialog />
        </div>
      </div>

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
            <div className="divide-y rounded-xl border">
              {filtered.map((home: HomeDTO) => (
                <div
                  key={home.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        #{home.id} • {home.name}
                      </span>
                      <Badge variant="outline">
                        {t("owner")}: {home.ownerUserId}
                      </Badge>
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                      {home.addressText || t("noAddress")}
                      {home.city && ` • ${home.city}`}
                      {home.postalCode && ` • ${home.postalCode}`}
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {t("created")}: {fmtDateTime(home.createdAt)} •{" "}
                      {t("updated")}: {fmtDateTime(home.updatedAt)}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <Link
                      className="text-sm underline underline-offset-4 hover:opacity-80"
                      href={`/homes/${home.id}/rooms`}
                    >
                      {t("rooms")}
                    </Link>
                    <Link
                      className="text-sm underline underline-offset-4 hover:opacity-80"
                      href={`/devices?homeId=${home.id}`}
                    >
                      {t("devices")}
                    </Link>
                  </div>
                </div>
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
