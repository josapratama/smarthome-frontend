"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MailPlus, Users, Clock, CheckCircle } from "lucide-react";
import { InviteDialog } from "@/app/user/invites/invite-dialog";
import { InviteList } from "@/app/user/invites/invite-list";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import { useLanguage } from "@/contexts/language-context";

interface Home {
  id: number;
  name: string;
  ownerUserId: number;
}

interface InviteStats {
  totalInvites: number;
  pendingInvites: number;
  acceptedInvites: number;
  activeMembers: number;
}

export default function InvitesPage() {
  const { t } = useLanguage();

  const { data: homes = [] } = useQuery({
    queryKey: ["homes-for-invite"],
    queryFn: async () => {
      const response = await apiFetchBrowser<{ data: Home[] }>("/api/v1/homes");
      return response.data || [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["invite-stats"],
    queryFn: async () => {
      const response = await apiFetchBrowser<{ data: InviteStats }>(
        "/api/v1/admin/invite-stats",
      );
      return (
        response.data || {
          totalInvites: 0,
          pendingInvites: 0,
          acceptedInvites: 0,
          activeMembers: 0,
        }
      );
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("homeInvites")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("manageMemberInvitations")}
          </p>
        </div>
        <InviteDialog homes={homes}>
          <Button>
            <Plus className="h-4 w-4" />
            {t("sendInvite")}
          </Button>
        </InviteDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("totalInvites")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {stats?.totalInvites || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("pending")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div className="text-3xl font-semibold">
                {stats?.pendingInvites || 0}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("accepted")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="text-3xl font-semibold">
                {stats?.acceptedInvites || 0}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {t("activeMembers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div className="text-3xl font-semibold">
                {stats?.activeMembers || 0}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InviteList />

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("quickActions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InviteDialog homes={homes}>
              <Button className="w-full justify-start" variant="outline">
                <MailPlus className="h-4 w-4" />
                {t("sendNewInvitation")}
              </Button>
            </InviteDialog>

            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4" />
              {t("viewAllMembers")}
            </Button>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">
                {t("availableHomes")}
              </h4>
              <div className="space-y-2">
                {homes.length > 0 ? (
                  homes.map((home) => (
                    <div
                      key={home.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                    >
                      <span className="text-sm">{home.name}</span>
                      <InviteDialog homes={[home]}>
                        <Button size="sm" variant="ghost">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </InviteDialog>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t("noHomesAvailable")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
