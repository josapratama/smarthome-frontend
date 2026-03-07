"use client";

import { useEffect, useState, useRef } from "react";
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
import { PageHeader } from "@/components/ui/page-header";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Key,
  LogOut,
  Save,
  X,
  Camera,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";

interface AdminProfile {
  id: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  googleName?: string;
  googlePicture?: string;
  avatarUrl?: string | null;
  authProvider?: string;
  createdAt: string;
}

export default function AdminProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [editedUsername, setEditedUsername] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("pleaseSelectImage"));
      return;
    }

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
        setShowPasswordForm(false);
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

  const getAvatarUrl = () => {
    if (profile?.avatarUrl) {
      return `http://localhost:3000${profile.avatarUrl}`;
    }
    if (profile?.googlePicture) {
      return profile.googlePicture;
    }
    return undefined;
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
        <PageHeader
          title={t("profileSettings")}
          description={t("manageAccount")}
        />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <>
        <PageHeader
          title={t("profileSettings")}
          description={t("manageAccount")}
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load profile</p>
        </div>
      </>
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
      <PageHeader
        title={t("profileSettings")}
        description={t("manageAccount")}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t("profile")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={getAvatarUrl()} alt={displayName} />
                  <AvatarFallback className="text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {!isGoogleUser && (
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    {profile.avatarUrl && (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8 rounded-full"
                        onClick={handleDeleteAvatar}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

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

              <Separator />

              {/* Security Section */}
              {!isGoogleUser && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      {t("security")}
                    </CardTitle>
                    <CardDescription>{t("changePasswordDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!showPasswordForm ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowPasswordForm(true)}
                      >
                        <Key className="h-4 w-4 mr-2" />
                        {t("changePassword")}
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                          ℹ️ {t("passwordChangeLimit")}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="oldPassword">
                            {t("currentPassword")}
                          </Label>
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
                          <Label htmlFor="newPassword">
                            {t("newPassword")}
                          </Label>
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
                        <div className="flex gap-2">
                          <Button
                            onClick={handleChangePassword}
                            disabled={isSaving}
                            className="flex-1"
                          >
                            {isSaving
                              ? t("changingPassword")
                              : t("changePassword")}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordForm({
                                oldPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                              });
                            }}
                          >
                            {t("cancel")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
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
