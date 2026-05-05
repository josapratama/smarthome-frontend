"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { HomeCreateRequest } from "@/lib/api/dto/homes.dto";

const INITIAL: HomeCreateRequest = {
  name: "",
  ownerUserId: 1,
  addressText: "",
  city: "",
  postalCode: "",
};

interface CreateHomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateHomeDialog({
  open,
  onOpenChange,
}: CreateHomeDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<HomeCreateRequest>(INITIAL);

  function update<K extends keyof HomeCreateRequest>(
    key: K,
    value: HomeCreateRequest[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const createMutation = useMutation({
    mutationFn: async (data: HomeCreateRequest) =>
      apiFetchBrowser("/api/v1/homes", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.homes.list() });
      onOpenChange(false);
      setForm(INITIAL);
      toast({ title: t("homeCreatedSuccessfully") });
    },
    onError: (err: any) =>
      toast({
        title: t("failedToCreateHome"),
        description: err.message || t("unknownError"),
        variant: "destructive",
      }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createNewHome")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="home-name">{t("name")} *</Label>
            <Input
              id="home-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder={t("homeName")}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="home-address">{t("address")}</Label>
            <Input
              id="home-address"
              value={form.addressText}
              onChange={(e) => update("addressText", e.target.value)}
              placeholder={t("fullAddress")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="home-city">{t("city")}</Label>
              <Input
                id="home-city"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder={t("city")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="home-postal">{t("postalCode")}</Label>
              <Input
                id="home-postal"
                value={form.postalCode}
                onChange={(e) => update("postalCode", e.target.value)}
                placeholder={t("postalCode")}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.name || createMutation.isPending}
            >
              {createMutation.isPending ? t("creating") : t("create")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
