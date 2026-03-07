"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Inbox } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { UserInvites } from "./user-invites";

export default function UserInvitesPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">{t("invitations")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("manageYourHomeInvitations")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t("pendingInvitations")}
          </CardTitle>
          <CardDescription>
            {t("acceptOrDeclineHomeInvitations")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserInvites />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("aboutInvitations")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-lg">📨</span>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">
                {t("receivingInvitations")}
              </h4>
              <p>{t("receivingInvitationsDesc")}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">
                {t("acceptingInvitations")}
              </h4>
              <p>{t("acceptingInvitationsDesc")}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <span className="text-lg">❌</span>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">
                {t("decliningInvitations")}
              </h4>
              <p>{t("decliningInvitationsDesc")}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <span className="text-lg">👥</span>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">
                {t("memberRoles")}
              </h4>
              <p>{t("memberRolesDesc")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
