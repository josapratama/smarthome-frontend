"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Shield, Lock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

export default function SecuritySettingsTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 24,
    requireEmailVerification: true,
    enableTwoFactor: false,
    passwordMinLength: 8,
    passwordRequireSpecialChar: true,
    passwordRequireNumber: true,
    passwordRequireUppercase: true,
    passwordExpiryDays: 90,
  });

  const handleSave = () => {
    toast({
      title: t("settingsSaved"),
      description: t("securitySettingsUpdated"),
    });
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{t("loginSecurity")}</h3>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="maxAttempts">{t("maxLoginAttempts")}</Label>
            <Input
              id="maxAttempts"
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxLoginAttempts: parseInt(e.target.value),
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              {t("maxLoginAttemptsDesc")}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="lockoutDuration">{t("lockoutDuration")}</Label>
            <Input
              id="lockoutDuration"
              type="number"
              value={settings.lockoutDuration}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  lockoutDuration: parseInt(e.target.value),
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              {t("lockoutDurationDesc")}
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sessionTimeout">{t("sessionTimeout")}</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  sessionTimeout: parseInt(e.target.value),
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              {t("sessionTimeoutDesc")}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("emailVerificationRequired")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("emailVerificationDesc")}
              </p>
            </div>
            <Switch
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, requireEmailVerification: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("twoFactorAuthentication")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("twoFactorDesc")}
              </p>
            </div>
            <Switch
              checked={settings.enableTwoFactor}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableTwoFactor: checked })
              }
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{t("passwordPolicy")}</h3>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="minLength">{t("minimumPasswordLength")}</Label>
            <Input
              id="minLength"
              type="number"
              value={settings.passwordMinLength}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  passwordMinLength: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("requireSpecialCharacters")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("specialCharsDesc")}
              </p>
            </div>
            <Switch
              checked={settings.passwordRequireSpecialChar}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  passwordRequireSpecialChar: checked,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("requireNumbers")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("numbersDesc")}
              </p>
            </div>
            <Switch
              checked={settings.passwordRequireNumber}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, passwordRequireNumber: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("requireUppercase")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("uppercaseDesc")}
              </p>
            </div>
            <Switch
              checked={settings.passwordRequireUppercase}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, passwordRequireUppercase: checked })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="expiryDays">{t("passwordExpiry")}</Label>
            <Input
              id="expiryDays"
              type="number"
              value={settings.passwordExpiryDays}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  passwordExpiryDays: parseInt(e.target.value),
                })
              }
            />
            <p className="text-sm text-muted-foreground">
              {t("passwordExpiryDesc")}
            </p>
          </div>
        </div>
      </Card>

      <Card className="border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-900">
              {t("securityNotice")}
            </p>
            <p className="text-sm text-amber-700">
              {t("securityNoticeMessage")}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {t("saveSettings")}
        </Button>
      </div>
    </div>
  );
}
