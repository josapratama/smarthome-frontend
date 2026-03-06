"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  Package,
  Upload,
  Activity,
  Bell,
  Mail,
  Terminal,
  Home,
  DoorOpen,
  AlertTriangle,
  Brain,
  Settings,
  Info,
  X,
  LogOut,
  User,
  Zap,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const navigation = [
    { name: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("devices"), href: "/devices", icon: Cpu },
    { name: t("homes"), href: "/homes", icon: Home },
    { name: t("rooms"), href: "/rooms", icon: DoorOpen },
    { name: t("firmware"), href: "/firmware", icon: Package },
    { name: t("ota"), href: "/ota", icon: Upload },
    { name: t("monitoring"), href: "/monitoring", icon: Activity },
    { name: t("alarms"), href: "/alarms", icon: AlertTriangle },
    { name: t("energy"), href: "/energy", icon: Zap },
    { name: t("commands"), href: "/commands", icon: Terminal },
    { name: t("notifications"), href: "/notifications", icon: Bell },
    { name: t("invites"), href: "/invites", icon: Mail },
    { name: t("messages"), href: "/messages", icon: MessageSquare },
    { name: t("aiModels"), href: "/ai", icon: Brain },
    { name: t("helpCenter"), href: "/help", icon: HelpCircle },
    { name: t("appInformation"), href: "/app-info", icon: Info },
    { name: t("settings"), href: "/settings", icon: Settings },
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
            <p className="text-xs text-muted-foreground mt-0.5">Panel Admin</p>
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
          href="/profile"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
            pathname === "/profile"
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
