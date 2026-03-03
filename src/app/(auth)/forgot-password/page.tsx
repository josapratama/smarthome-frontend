"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, ArrowLeft, Moon, Sun, Globe, Home } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PublicSettingsProvider,
  usePublicSettings,
} from "@/contexts/public-settings-context";

function ForgotPasswordContent() {
  const router = useRouter();
  const { t, language, setLanguage, theme, setTheme } = usePublicSettings();

  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setErr(payload?.message ?? t("failedSendResetRequest"));
        return;
      }

      setSent(true);
    } catch {
      setErr(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
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
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === "id" ? "en" : "id")}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">
                {language === "id" ? "ID" : "EN"}
              </span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <Link href="/">
              <Button variant="ghost" size="sm">
                {t("backToHome")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg items-center justify-center p-6">
        <Card className="w-full shadow-2xl border-2">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {t("forgotPassword")}
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              {t("forgotPasswordSubtitle")}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {sent ? (
              <div className="space-y-4">
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-2 font-medium">
                    <Mail className="h-4 w-4" />
                    {t("requestSent")}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {t("requestSentDesc")}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="w-full"
                    onClick={() => router.push("/login")}
                  >
                    {t("backToLogin")}
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      setSent(false);
                      setEmail("");
                    }}
                  >
                    {t("sendAgain")}
                  </Button>
                </div>

                <div className="text-center text-xs text-muted-foreground">
                  {t("didntReceiveEmail")}
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={t("enterEmail")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="h-11"
                  />
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
                      {t("sending")}
                    </span>
                  ) : (
                    t("sendResetInstructions")
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

export default function ForgotPasswordPage() {
  return (
    <PublicSettingsProvider>
      <ForgotPasswordContent />
    </PublicSettingsProvider>
  );
}
