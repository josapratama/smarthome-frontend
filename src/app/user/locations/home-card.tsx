"use client";

import { Home } from "@/lib/api/client/homes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home as HomeIcon, MapPin, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

interface HomeCardProps {
  home: Home;
  onEdit?: (home: Home) => void;
  onDelete?: (home: Home) => void;
}

export function HomeCard({ home, onEdit, onDelete }: HomeCardProps) {
  const { t } = useTranslation();
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <HomeIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{home.name}</CardTitle>
        </div>
        <div className="flex gap-1">
          {onEdit && (
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(home)}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(home)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {home.addressText && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <div>{home.addressText}</div>
              {home.city && (
                <div>
                  {home.city}
                  {home.postalCode && `, ${home.postalCode}`}
                </div>
              )}
            </div>
          </div>
        )}
        <Link href={`/user/homes/${home.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            {t("viewDetails") || "View Details"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
