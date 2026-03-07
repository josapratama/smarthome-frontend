"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import {
  Plus,
  MailPlus,
  Users,
  Clock,
  CheckCircle,
  Mail,
  Search,
} from "lucide-react";
import { InviteDialog } from "@/app/user/invites/invite-dialog";
import { InviteList } from "@/app/user/invites/invite-list";
import { apiFetchBrowser } from "@/lib/api/client.browser";
import { useLanguage } from "@/contexts/language-context";
import { useState } from "react";

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

export default function InvitesUI() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const searchSectionRef = useRef<HTMLDivElement>(null);
  const filterSectionRef = useRef<HTMLDivElement>(null);

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

    const handleFilter = () => {
      if (filterSectionRef.current) {
        filterSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        filterSectionRef.current.classList.add(
          "ring-2",
          "ring-primary",
          "ring-offset-2",
        );
        setTimeout(() => {
          filterSectionRef.current?.classList.remove(
            "ring-2",
            "ring-primary",
            "ring-offset-2",
          );
        }, 2000);
      }
    };

    window.addEventListener("topbar-search", handleSearch);
    window.addEventListener("topbar-filter", handleFilter);

    return () => {
      window.removeEventListener("topbar-search", handleSearch);
      window.removeEventListener("topbar-filter", handleFilter);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div ref={searchSectionRef}>
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

        <div ref={filterSectionRef}>
          <Card className="rounded-2xl shadow-sm transition-all duration-300">
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
    </div>
  );
}
