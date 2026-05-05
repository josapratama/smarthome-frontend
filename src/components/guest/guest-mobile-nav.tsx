"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cpu, Home, User } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

export function GuestMobileNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navigation = [
    { name: t("dashboard"), href: "/guest/dashboard", icon: LayoutDashboard },
    { name: t("devices"), href: "/guest/devices", icon: Cpu },
    { name: t("homes"), href: "/guest/homes", icon: Home },
    { name: t("profile"), href: "/guest/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden">
      <div className="grid grid-cols-4 gap-1 p-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                isActive
                  ? "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
