"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import {
  formatKey,
  getCategoryTitle,
  getCategoryDescription,
} from "../utils/format";
import type { AppInfoItem } from "../hooks";

interface AppInfoCardProps {
  category: string;
  items: AppInfoItem[];
}

export function AppInfoCard({ category, items }: AppInfoCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          {getCategoryTitle(category, t)}
        </CardTitle>
        <CardDescription>{getCategoryDescription(category, t)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((info) => (
            <div key={info.key} className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">
                {formatKey(info.key)}
              </h4>
              <p className="text-base whitespace-pre-wrap">{info.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
