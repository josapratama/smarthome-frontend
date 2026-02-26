"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Camera,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Globe,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/contexts/language-context";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  googlePicture?: string | null;
  authProvider?: string | null;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok) {
        setUser(data.data);
        setProfileForm({
          username: data.data.username,
          email: data.data.email,
        });
      }
    } catch (error) {
      toast.error(t("failedLoadProfile"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      if (res.ok) {
        toast.success(t("profileUpdatedSuccess"));
        loadProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || t("failedUpdateProfile"));
      }
    } catch (error) {
      toast.error(t("failedUpdateProfile"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error(t("passwordMinLength"));
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const remainingChanges = data.data?.remainingChanges;
        if (remainingChanges !== undefined) {
          toast.success(
            t("passwordChangedSuccess").replace(
              "{count}",
              remainingChanges.toString(),
            ),
          );
        } else {
          toast.success(t("passwordChangedSuccess").replace("{count}", "0"));
        }
        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const data = await res.json();
        const errorMsg =
          data.error === "PASSWORD_CHANGE_LIMIT_EXCEEDED"
            ? t("passwordChangeLimitExceeded")
            : data.error === "INVALID_CREDENTIALS"
              ? t("currentPasswordIncorrect")
              : data.error || t("failedChangePassword");
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error(t("failedChangePassword"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("pleaseSelectImage"));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("imageSizeLimit"));
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/auth/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success(t("avatarUploadedSuccess"));
        loadProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || t("failedUploadAvatar"));
      }
    } catch (error) {
      toast.error(t("failedUploadAvatar"));
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!confirm(t("deleteAvatarConfirm"))) return;

    try {
      const res = await fetch("/api/auth/profile/avatar", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(t("avatarDeletedSuccess"));
        loadProfile();
      } else {
        toast.error(t("failedDeleteAvatar"));
      }
    } catch (error) {
      toast.error(t("failedDeleteAvatar"));
    }
  };

  const getAvatarUrl = () => {
    if (user?.avatarUrl) {
      return `http://localhost:3000${user.avatarUrl}`;
    }
    if (user?.googlePicture) {
      return user.googlePicture;
    }
    return undefined;
  };

  const getInitials = () => {
    if (!user) return "?";
    return user.username.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t("loadingProfile")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("settings")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("manageAccountSettings")}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
          <TabsTrigger value="security">{t("security")}</TabsTrigger>
          <TabsTrigger value="preferences">{t("preferences")}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                {t("profilePicture")}
              </CardTitle>
              <CardDescription>{t("uploadProfilePicture")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={getAvatarUrl()} alt={user?.username} />
                  <AvatarFallback className="text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      size="sm"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isUploadingAvatar
                        ? t("uploadingPhoto")
                        : t("uploadPhoto")}
                    </Button>
                    {user?.avatarUrl && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteAvatar}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("delete")}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("jpgPngWebp")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("profileInformation")}
              </CardTitle>
              <CardDescription>{t("updateAccountInformation")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t("username")}</Label>
                <Input
                  id="username"
                  value={profileForm.username}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, username: e.target.value })
                  }
                  disabled={user?.authProvider === "google"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <div className="flex gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground mt-2" />
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    disabled={user?.authProvider === "google"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("role")}</Label>
                <div className="flex gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground mt-2" />
                  <Input value={user?.role} disabled />
                </div>
              </div>
              {user?.authProvider === "google" && (
                <p className="text-sm text-muted-foreground">
                  {t("yourAccountManagedByGoogle")}
                </p>
              )}
              <Button
                onClick={handleUpdateProfile}
                disabled={isSaving || user?.authProvider === "google"}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? t("saving") : t("saveChanges")}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("changePasswordTitle")}</CardTitle>
              <CardDescription>{t("changePasswordDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.authProvider === "google" ? (
                <p className="text-sm text-muted-foreground">
                  {t("googlePasswordChange")}
                </p>
              ) : (
                <>
                  <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                    ℹ️ {t("passwordChangeLimit")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">{t("currentPassword")}</Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={passwordForm.oldPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          oldPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t("newPassword")}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {t("confirmNewPassword")}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? t("changingPassword") : t("changePassword")}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                {t("themeTitle")}
              </CardTitle>
              <CardDescription>{t("choosePreferredTheme")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      {t("lightTheme")}
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      {t("darkTheme")}
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      {t("system")}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t("languageTitle")}
              </CardTitle>
              <CardDescription>{t("choosePreferredLanguage")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">🇮🇩 Bahasa Indonesia</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                  <SelectItem value="ja">🇯🇵 日本語</SelectItem>
                  <SelectItem value="zh">🇨🇳 中文</SelectItem>
                  <SelectItem value="ko">🇰🇷 한국어</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
