"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "@/hooks/use-translation";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { membersApi, InviteMemberInput } from "@/lib/api/client/members";
import { toast } from "sonner";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  roleInHome: z.enum(["MEMBER", "GUEST"]),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homeId: number;
  onSuccess: () => void;
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  homeId,
  onSuccess,
}: InviteMemberDialogProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      roleInHome: "MEMBER",
    },
  });

  const onSubmit = async (data: InviteFormData) => {
    setIsLoading(true);
    try {
      await membersApi.invite(homeId, data);
      toast.success(
        t("invitationSentSuccess") || "Invitation sent successfully",
      );
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(
        error.message ||
          t("failedToSendInvitation") ||
          "Failed to send invitation",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("inviteMember") || "Invite Member"}</DialogTitle>
          <DialogDescription>
            {t("inviteMemberDescription") ||
              "Send an invitation to add a new member to your home."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("emailAddress") || "Email Address"} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleInHome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("role") || "Role"} *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("selectRole") || "Select a role"}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MEMBER">
                        {t("memberRole") || "Member"} -{" "}
                        {t("memberRoleDesc") || "Full access to devices"}
                      </SelectItem>
                      <SelectItem value="GUEST">
                        {t("guestRole") || "Guest"} -{" "}
                        {t("guestRoleDesc") || "Read-only access"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t("roleDescription") ||
                      "Members can control devices, guests can only view."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {t("cancel") || "Cancel"}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? t("sending") || "Sending..."
                  : t("sendInvitation") || "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
