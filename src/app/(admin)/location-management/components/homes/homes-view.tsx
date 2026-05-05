"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/queries";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type { HomeDTO, HomesListResponse } from "@/lib/api/dto/homes.dto";
import { useTranslation } from "@/hooks/use-translation";
import { PageHeader } from "@/components/ui/page-header";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Home as HomeIcon, Search } from "lucide-react";

import { HomeCard } from "./home-card";
import { CreateHomeDialog } from "./create-home-dialog";

export function HomesView() {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Topbar events ─────────────────────────────────────────
  useEffect(() => {
    const onSearch = () => {
      const input =
        searchRef.current?.querySelector("input") ??
        (document.querySelector("input") as HTMLInputElement | null);
      input?.focus();
      input?.select();
    };
    window.addEventListener("topbar-search", onSearch);
    window.addEventListener("topbar-add", () => setCreateOpen(true));
    return () => {
      window.removeEventListener("topbar-search", onSearch);
      window.removeEventListener("topbar-add", () => {});
    };
  }, []);

  const homesQuery = useQuery({
    queryKey: qk.homes.list(),
    queryFn: async () => {
      const res = await apiFetchBrowser<HomesListResponse>("/api/v1/homes");
      return res.data ?? [];
    },
  });

  const filtered = (homesQuery.data ?? []).filter((home: HomeDTO) => {
    const q = searchText.toLowerCase();
    return (
      home.name.toLowerCase().includes(q) ||
      (home.city ?? "").toLowerCase().includes(q) ||
      String(home.id).includes(q)
    );
  });

  return (
    <div className="space-y-6">
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

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div ref={searchRef} className="flex-1">
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
        <Button
          onClick={() => setCreateOpen(true)}
          className="shadow-md hover:shadow-lg transition-all"
        >
          <HomeIcon className="h-4 w-4 mr-2" />
          {t("addHome")}
        </Button>
      </div>

      <CreateHomeDialog open={createOpen} onOpenChange={setCreateOpen} />

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("homesList")}</CardTitle>
        </CardHeader>
        <CardContent>
          {homesQuery.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : homesQuery.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {(homesQuery.error as Error).message}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {searchText ? t("noHomesMatchSearch") : t("noHomesFound")}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((home) => (
                <HomeCard key={home.id} home={home} />
              ))}
            </div>
          )}
          {homesQuery.isFetching && !homesQuery.isLoading && (
            <p className="mt-3 text-xs text-muted-foreground">
              {t("updating")}…
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
