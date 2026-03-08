"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface UserSidebarProps {
  className?: string;
  onClose?: () => void;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
}

export function UserSidebar({ className, onClose }: UserSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
    }
  };

  const navigation = [
    { name: t("dashboard"), href: "/user/dashboard", icon: LayoutDashboard },
    { name: t("devices"), href: "/user/devices", icon: Cpu },
    { name: t("locations"), href: "/user/locations", icon: Home },
    { name: t("energy"), href: "/user/energy", icon: Zap },
    { name: t("alerts"), href: "/user/alerts", icon: AlertTriangle },
    { name: t("support"), href: "/user/support", icon: HelpCircle },
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside
      className={cn(
        "w-64 flex h-screen flex-col bg-card border-r border-border",
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">SH</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none">Smart Home</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("userPanel") || "Panel Pengguna"}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-muted lg:hidden transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User Profile Card */}
      {userProfile && (
        <div className="p-4 border-b">
          <Link
            href="/user/profile"
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-all group"
          >
            <Avatar className="h-12 w-12 border-2 border-primary/20 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
              <AvatarImage
                src={userProfile.avatarUrl}
                alt={userProfile.username}
              />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-semibold">
                {getInitials(userProfile.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate">
                  {userProfile.username}
                </p>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {t("user") || "User"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {userProfile.email}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      )}

      {/* Navigation */}
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
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground hover:bg-accent hover:translate-x-0.5",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Logout Button */}
      <div className="p-3">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 px-3 py-3 h-auto text-sm font-medium text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>{t("logout")}</span>
        </Button>
      </div>
    </aside>
  );
}
