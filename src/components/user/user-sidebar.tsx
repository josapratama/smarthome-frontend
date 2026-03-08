"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  Home,
  Zap,
  AlertTriangle,
  Settings,
  Info,
  X,
  LogOut,
  User,
  HelpCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface UserSidebarProps {
  className?: string;
  onClose?: () => void;
}

export function UserSidebar({ className, onClose }: UserSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const navigation = [
    { name: t("dashboard"), href: "/user/dashboard", icon: LayoutDashboard },
    { name: t("devices"), href: "/user/devices", icon: Cpu },
    { name: t("locations") || "Lokasi", href: "/user/locations", icon: Home }, // Homes & Rooms
    { name: t("energy"), href: "/user/energy", icon: Zap },
    {
      name: t("alerts") || "Peringatan",
      href: "/user/alerts",
      icon: AlertTriangle,
    }, // Alarms & Notifications
    {
      name: t("support") || "Bantuan",
      href: "/user/support",
      icon: HelpCircle,
    }, // Messages & FAQ
    { name: t("appInformation"), href: "/user/app-info", icon: Info },
    { name: t("settings"), href: "/user/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside
      className={cn(
        "w-64 flex h-screen flex-col bg-card border-r border-border",
        className,
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <span className="text-white font-bold">SH</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">Smart Home</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Panel Pengguna
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-muted lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-accent",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User Profile & Logout */}
      <div className="p-3 space-y-2">
        <Link
          href="/user/profile"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
            pathname === "/user/profile"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-foreground hover:bg-accent",
          )}
        >
          <User className="h-5 w-5 shrink-0" />
          <span>{t("profile")}</span>
        </Link>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 px-3 py-3 h-auto text-sm font-medium text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>{t("logout")}</span>
        </Button>
      </div>
    </aside>
  );
}
