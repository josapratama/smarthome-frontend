"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowLeft, KeyRound, Home } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PublicSettingsProvider,
  usePublicSettings,
} from "@/contexts/public-settings-context";
import { AuthRedirect } from "@/components/landing/auth-redirect";

function ResetPasswordForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { t } = usePublicSettings();

  const tokenFromUrl = sp.get("token") ?? "";

  const [token, setToken] = React.useState(tokenFromUrl);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  const [showPw, setShowPw] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!token.trim()) {
      setErr(t("tokenRequired"));
      return;
    }
    if (password.length < 8) {
      setErr(t("passwordMinLength"));
      return;
    }
    if (password !== confirm) {
      setErr(t("passwordsDoNotMatch"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: token.trim(), newPassword: password }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setErr(payload?.message ?? t("resetPasswordFailed"));
        return;
      }

      setDone(true);
    } catch {
      setErr(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <AuthRedirect />
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Home className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Smart Home</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              {t("backToHome")}
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg items-center justify-center p-6">
        <Card className="w-full shadow-2xl border-2">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {t("resetPassword")}
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              {t("resetPasswordDesc")}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {done ? (
              <div className="space-y-4">
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-2 font-medium">
                    <KeyRound className="h-4 w-4" />
                    {t("passwordResetSuccess")}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {t("passwordResetSuccessDesc")}
                  </div>
                </div>

                <Button
                  className="w-full h-11"
                  onClick={() => router.push("/login")}
                >
                  {t("goToLogin")}
                </Button>

                <div className="text-center text-xs text-muted-foreground">
                  {t("resetPasswordHelpText")}
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">{t("resetToken")}</Label>
                  <Input
                    id="token"
                    placeholder={t("pasteTokenFromEmail")}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={loading}
                    required
                    className="h-11"
                  />
                  <div className="text-xs text-muted-foreground">
                    {t("tokenHint")}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{t("newPassword")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={t("minChars")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                      className="pr-10 h-11"
                    />
                    <button
                      type="button"
                      aria-label={showPw ? "Hide password" : "Show password"}
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                      disabled={loading}
                    >
                      {showPw ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">{t("confirmNewPassword")}</Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={t("repeatNewPassword")}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      disabled={loading}
                      required
                      className="pr-10 h-11"
                    />
                    <button
                      type="button"
                      aria-label={
                        showConfirm
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                      disabled={loading}
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {mismatch ? (
                    <div className="text-xs text-destructive">
                      {t("confirmMismatch")}
                    </div>
                  ) : null}
                </div>

                {err ? (
                  <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {err}
                  </div>
                ) : null}

                <Button className="w-full h-11" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("processing")}
                    </span>
                  ) : (
                    t("resetPasswordButton")
                  )}
                </Button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("backToLogin")}
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {t("footerText")}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <PublicSettingsProvider>
      <React.Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </React.Suspense>
    </PublicSettingsProvider>
  );
}
