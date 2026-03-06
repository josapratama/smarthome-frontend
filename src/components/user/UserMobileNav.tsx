"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cpu, Home, MessageSquare, User } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export function UserMobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navigation = [
    {
      name: t("dashboard"),
      href: "/user/dashboard",
      icon: LayoutDashboard,
      label: "Home",
    },
    {
      name: t("devices"),
      href: "/user/devices",
      icon: Cpu,
      label: "Devices",
    },
    {
      name: t("homes"),
      href: "/user/homes",
      icon: Home,
      label: "Homes",
    },
    {
      name: t("messages"),
      href: "/user/messages",
      icon: MessageSquare,
      label: "Chat",
    },
    {
      name: t("profile"),
      href: "/user/profile",
      icon: User,
      label: "Profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-card/95 backdrop-blur-sm lg:hidden shadow-lg">
      <div className="flex items-center justify-around px-2">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-all relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
              )}
              <div
                className={cn(
                  "flex items-center justify-center rounded-xl transition-all",
                  isActive ? "bg-primary/10 p-2" : "p-2",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all",
                    isActive && "scale-110",
                  )}
                />
              </div>
              <span
                className={cn(
                  "truncate text-[10px] font-medium",
                  isActive && "font-semibold",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
