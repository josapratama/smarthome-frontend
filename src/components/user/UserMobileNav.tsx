"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cpu, Home, Zap, Settings } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export function UserMobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navigation = [
    { name: t("dashboard"), href: "/user/dashboard", icon: LayoutDashboard },
    { name: t("devices"), href: "/user/devices", icon: Cpu },
    { name: t("homes"), href: "/user/homes", icon: Home },
    { name: t("energy"), href: "/user/energy", icon: Zap },
    { name: t("settings"), href: "/user/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card lg:hidden">
      <div className="flex items-center justify-around">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
