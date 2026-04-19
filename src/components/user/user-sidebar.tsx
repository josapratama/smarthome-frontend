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
  UserCircle,
  HelpCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { browserApi } from "@/lib/api/client/fetch";

interface UserSidebarProps {
  className?: string;
  onClose?: () => void;
}

interface UserProfile {
  username: string;
  email: string;
  avatarUrl?: string;
}

export function UserSidebar({ className, onClose }: UserSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const res = await fetch("/api/user/me", { credentials: "include" });
      if (!res.ok) throw new Error("UNAUTHORIZED");
      const result = await res.json();
      setUserProfile(result.data);
    } catch (error) {
      console.error("Failed to load user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/login");
    }
  };

  return (
    <aside
      className={cn(
        "w-64 flex h-screen flex-col bg-card border-r border-border",
        className,
      )}
    >
      {/* Header with User Profile */}
      <div className="flex items-center gap-3 border-b px-4 py-3 bg-accent/30">
        <div className="relative flex-shrink-0">
          <Avatar className="h-11 w-11 border-2 border-primary/30 shadow-md">
            {userProfile?.avatarUrl && (
              <AvatarImage
                src={userProfile.avatarUrl}
                alt={userProfile.username}
              />
            )}
            <AvatarFallback className="bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-white font-semibold">
              {isLoading ? (
                <UserCircle className="h-6 w-6" />
              ) : userProfile?.username ? (
                getInitials(userProfile.username)
              ) : (
                <UserCircle className="h-6 w-6" />
              )}
            </AvatarFallback>
          </Avatar>
          {/* Online Status Indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-card shadow-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {isLoading ? t("loading") : (userProfile?.username ?? t("user"))}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {isLoading ? "" : (userProfile?.email ?? "")}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-muted lg:hidden transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

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

      {/* Profile & Logout Buttons */}
      <div className="p-3 space-y-1">
        <Link
          href="/user/profile"
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
            pathname === "/user/profile"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-foreground hover:bg-accent",
          )}
        >
          <UserCircle className="h-5 w-5 shrink-0" />
          <span>{t("profile")}</span>
        </Link>
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
