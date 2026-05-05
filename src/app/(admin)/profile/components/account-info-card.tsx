"use client";

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
import { Save, X, User, Mail } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { AdminProfile } from "../lib/profile.types";

interface AccountInfoCardProps {
  profile: AdminProfile;
  isEditing: boolean;
  isSaving: boolean;
  editedUsername: string;
  editedEmail: string;
  onUsernameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onEditStart: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export function AccountInfoCard({
  profile,
  isEditing,
  isSaving,
  editedUsername,
  editedEmail,
  onUsernameChange,
  onEmailChange,
  onEditStart,
  onSave,
  onCancel,
}: AccountInfoCardProps) {
  const { t } = useTranslation();
  const isGoogleUser = profile.authProvider === "google";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("accountInformation")}</CardTitle>
            <CardDescription>{t("updateAccountDetails")}</CardDescription>
          </div>
          {!isEditing && (
            <Button onClick={onEditStart} variant="outline">
              {t("editProfile")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">{t("username")}</Label>
          {isEditing ? (
            <Input
              id="username"
              value={editedUsername}
              onChange={(e) => onUsernameChange(e.target.value)}
              disabled={isSaving}
            />
          ) : (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{profile.username}</span>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          {isEditing ? (
            <Input
              id="email"
              type="email"
              value={editedEmail}
              onChange={(e) => onEmailChange(e.target.value)}
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

        {/* Save / Cancel */}
        {isEditing && (
          <div className="flex gap-2 pt-2">
            <Button onClick={onSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? t("saving") : t("saveChanges")}
            </Button>
            <Button onClick={onCancel} variant="outline" disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              {t("cancel")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
