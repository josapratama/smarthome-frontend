"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MailPlus, Users, Search } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { InviteDialog } from "@/app/user/invites/invite-dialog";
import { InviteList } from "@/app/user/invites/invite-list";
import { apiFetchBrowser } from "@/lib/api/client/fetch";

interface Home {
  id: number;
  name: string;
  ownerUserId: number;
}

export function InvitesView() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const { data: homes = [] } = useQuery({
    queryKey: ["homes-for-invite"],
    queryFn: async () => {
      const res = await apiFetchBrowser<{ data: Home[] }>("/api/v1/homes");
      return res.data ?? [];
    },
  });

  // ── Topbar events ─────────────────────────────────────────
  useEffect(() => {
    const onSearch = () => {
      const input =
        searchRef.current?.querySelector("input") ??
        (document.querySelector("input") as HTMLInputElement | null);
      input?.focus();
      input?.select();
    };
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
    window.addEventListener("topbar-search", onSearch);
    window.addEventListener("topbar-filter", onFilter);
    return () => {
      window.removeEventListener("topbar-search", onSearch);
      window.removeEventListener("topbar-filter", onFilter);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div ref={searchRef}>
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchInvites")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InviteList />

        <div ref={filterRef}>
          <Card className="rounded-2xl shadow-sm transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-base">{t("quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InviteDialog homes={homes}>
                <Button className="w-full justify-start" variant="outline">
                  <MailPlus className="h-4 w-4 mr-2" />
                  {t("sendNewInvitation")}
                </Button>
              </InviteDialog>

              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
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
    </div>
  );
}
