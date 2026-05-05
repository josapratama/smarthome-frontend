"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface ThemeSectionProps {
  theme: string;
  onThemeChange: (value: string) => void;
}

export function ThemeSection({ theme, onThemeChange }: ThemeSectionProps) {
  const { t } = useTranslation();

  return (
    <Card className="rounded-2xl shadow-sm border-0 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Moon className="h-5 w-5 text-primary" />
          {t("theme")}
        </CardTitle>
        <CardDescription className="text-sm">
          {t("customizeAppearance")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={theme} onValueChange={onThemeChange}>
          <SelectTrigger className="h-12 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">
              <div className="flex items-center gap-3 py-1">
                <Sun className="h-5 w-5" />
                <span>{t("lightTheme")}</span>
              </div>
            </SelectItem>
            <SelectItem value="dark">
              <div className="flex items-center gap-3 py-1">
                <Moon className="h-5 w-5" />
                <span>{t("darkTheme")}</span>
              </div>
            </SelectItem>
            <SelectItem value="system">
              <div className="flex items-center gap-3 py-1">
                <Monitor className="h-5 w-5" />
                <span>{t("system")}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
