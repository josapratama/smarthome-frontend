"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Eye, Home as HomeIcon, MapPin, Search, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

interface Home {
  id: number;
  name: string;
  addressText?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  _count?: {
    rooms: number;
    devices: number;
    members: number;
  };
}

export default function GuestHomesPage() {
  const { t } = useLanguage();
  const [homes, setHomes] = useState<Home[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadHomes();
  }, []);

  const loadHomes = async () => {
    try {
      const res = await fetch("/api/homes");
      if (res.ok) {
        const data = await res.json();
        setHomes(data.data || []);
      }
    } catch (error: any) {
      toast.error(error.message || t("failedLoadHomes"));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHomes = homes.filter(
    (home) =>
      home.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      home.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      home.addressText?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("homes")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("viewHomesYouHaveAccessTo")}
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Eye className="h-3 w-3" />
          {t("guestAccess")}
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("searchHomes")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Homes Grid */}
      {filteredHomes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredHomes.map((home) => (
            <Link key={home.id} href={`/guest/homes/${home.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl">{home.name}</CardTitle>
                      {(home.city || home.addressText) && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {home.addressText || home.city}
                          </span>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="gap-1 shrink-0">
                      <Eye className="h-3 w-3" />
                      {t("guest")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {home._count?.rooms || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("rooms")}
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {home._count?.devices || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("devices")}
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {home._count?.members || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("members")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <HomeIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? t("noHomesFound") : t("noHomesYet")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? t("tryDifferentSearch")
                : t("waitForHomeInvitation")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
