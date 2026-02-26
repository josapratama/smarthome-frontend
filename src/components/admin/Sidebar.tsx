"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const pathname = usePathname();
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
    { name: "Commands", href: "/commands", icon: Terminal },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Invites", href: "/invites", icon: Mail },
    { name: "AI Models", href: "/ai", icon: Brain },
    { name: "App Info", href: "/app-info", icon: Info },
    { name: t("settings"), href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={cn("flex h-screen w-64 flex-col border-r bg-card", className)}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
        <h1 className="text-lg font-bold">Smart Home</h1>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-muted lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
