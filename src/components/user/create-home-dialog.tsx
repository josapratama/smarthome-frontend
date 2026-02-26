"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { homesApi, CreateHomeInput } from "@/lib/api/client/homes";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";

const homeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  addressText: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
});

type HomeFormData = z.infer<typeof homeSchema>;

interface CreateHomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: number;
}

export function CreateHomeDialog({
  open,
  onOpenChange,
  onSuccess,
  userId,
}: CreateHomeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const form = useForm<HomeFormData>({
    resolver: zodResolver(homeSchema),
    defaultValues: {
      name: "",
      addressText: "",
      city: "",
      postalCode: "",
    },
  });

  const onSubmit = async (data: HomeFormData) => {
    setIsLoading(true);
    try {
      const input: CreateHomeInput = {
        ...data,
        ownerUserId: userId,
      };
      await homesApi.create(input);
      toast.success(t("homeCreated"));
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || t("failedCreateHome"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("createNewHome")}</DialogTitle>
          <DialogDescription>{t("addNewHomeDesc")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("homeName")} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t("myHome")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("address")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("addressPlaceholder")}
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("city")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("cityPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("postalCode")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("postalCodePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t("creating") : t("createHome")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
