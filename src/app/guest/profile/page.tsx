"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, User, Mail, Calendar, Shield } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/language-context";

interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
}

export default function GuestProfilePage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.data);
      }
    } catch (error: any) {
      toast.error(error.message || t("failedLoadProfile"));
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t("profile")}</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("profileNotFound")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("unableToLoadProfile")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("profile")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("viewYourProfileInfo")}
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Eye className="h-3 w-3" />
          {t("readOnly")}
        </Badge>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
              <AvatarFallback className="text-2xl">
                {getInitials(profile.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{profile.fullName}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {profile.role}
                </Badge>
                <Badge
                  variant="outline"
                  className="gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                >
                  <Eye className="h-3 w-3" />
                  {t("guestAccess")}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("email")}</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("memberSince")}
                </p>
                <p className="font-medium">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("userId")}</p>
                <p className="font-medium">#{profile.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("role")}</p>
                <p className="font-medium">{profile.role}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest Info */}
      <Card className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                {t("profileReadOnly")}
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                {t("guestCannotEditProfile")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
