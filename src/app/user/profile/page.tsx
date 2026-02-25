"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Key,
  LogOut,
  Save,
  X,
  Moon,
  Sun,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/contexts/language-context";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  googleName?: string;
  googlePicture?: string;
  authProvider?: string;
  createdAt: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editedUsername, setEditedUsername] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (res.ok && data.data) {
        setProfile(data.data);
        setEditedUsername(data.data.username);
        setEditedEmail(data.data.email);
      } else {
        toast.error(t("profileUpdateFailed"));
      }
    } catch (error) {
      toast.error(t("profileUpdateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    if (!editedUsername.trim()) {
      toast.error(t("usernameRequired"));
      return;
    }

    if (!editedEmail.trim() || !editedEmail.includes("@")) {
      toast.error(t("emailInvalid"));
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editedUsername,
          email: editedEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data.data);
        setIsEditing(false);
        toast.success(t("profileUpdated"));
      } else {
        toast.error(data.error || t("profileUpdateFailed"));
      }
    } catch (error) {
      toast.error(t("profileUpdateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditedUsername(profile.username);
      setEditedEmail(profile.email);
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  const isGoogleUser = profile.authProvider === "google";
  const displayName = profile.googleName || profile.username;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">{t("profileSettings")}</h1>
        <p className="text-muted-foreground mt-1">{t("manageAccount")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t("profile")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.googlePicture} alt={displayName} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-semibold text-lg">{displayName}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>

              <Badge
                variant={profile.role === "ADMIN" ? "default" : "secondary"}
              >
                <Shield className="h-3 w-3 mr-1" />
                {profile.role}
              </Badge>

              {isGoogleUser && (
                <Badge variant="outline" className="gap-1">
                  <svg className="h-3 w-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                  </svg>
                  {t("googleAccount")}
                </Badge>
              )}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {t("joined")}{" "}
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information & Settings */}
        <div className="md:col-span-2 space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("accountInformation")}</CardTitle>
                  <CardDescription>{t("updateAccountDetails")}</CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    {t("editProfile")}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t("username")}</Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      value={editedUsername}
                      onChange={(e) => setEditedUsername(e.target.value)}
                      disabled={isSaving}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.username}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      disabled={isSaving || isGoogleUser}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {isGoogleUser && isEditing && (
                    <p className="text-xs text-muted-foreground">
                      {t("emailCannotChange")}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? t("saving") : t("saveChanges")}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t("cancel")}
                    </Button>
                  </div>
                )}
              </div>

              {!isGoogleUser && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>{t("password")}</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => router.push("/user/change-password")}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      {t("changePassword")}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t("appearance")}</CardTitle>
              <CardDescription>
                {language === "id"
                  ? "Sesuaikan pengalaman Anda"
                  : "Customize your experience"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Switcher */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("theme")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {theme === "dark" ? t("darkMode") : t("lightMode")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                  <Moon className="h-4 w-4" />
                </div>
              </div>

              <Separator />

              {/* Language Selector */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("language")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "id" ? t("indonesian") : t("english")}
                  </p>
                </div>
                <Select
                  value={language}
                  onValueChange={(val) => setLanguage(val as "id" | "en")}
                >
                  <SelectTrigger className="w-[180px]">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">{t("indonesian")}</SelectItem>
                    <SelectItem value="en">{t("english")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("accountActions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t("logout")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
