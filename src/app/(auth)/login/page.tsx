"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Home, Zap, Shield, Lock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  PublicSettingsProvider,
  usePublicSettings,
} from "@/contexts/public-settings-context";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/dashboard";
  const { toast } = useToast();
  const { t } = usePublicSettings();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);

  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
        credentials: "include",
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg = payload?.message ?? payload?.error ?? t("loginFailed");
        setErr(errorMsg);
        toast({
          title: t("loginFailed"),
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      // Success toast
      toast({
        title: t("loginSuccess"),
        description: t("welcomeBack"),
        variant: "success",
      });

      // Redirect based on user role from response
      const redirectPath = payload?.data?.redirectTo || next;

      // Use window.location for full navigation — ensures server middleware
      // reads the newly set httpOnly cookies correctly
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 300);
    } catch {
      const errorMsg = t("networkError");
      setErr(errorMsg);
      toast({
        title: t("connectionFailed"),
        description: errorMsg,
        variant: "destructive",
      });
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
          <Link href="/">
            <Button variant="ghost" size="sm">
              {t("backToHome")}
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Side - Info */}
          <div className="hidden lg:block space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">
                {t("welcomeToSmartHome")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("loginDescription")}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t("securePrivate")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("securePrivateDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t("realtimeControl")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("realtimeControlDesc")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t("roleBasedAccess")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("roleBasedAccessDesc")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-6 border">
              <div className="text-sm text-muted-foreground mb-2">
                {t("demoCredentials")}
              </div>
              <div className="space-y-2 font-mono text-sm">
                <div>
                  <span className="text-muted-foreground">Admin:</span>{" "}
                  <span className="font-semibold">admin / admin123</span>
                </div>
                <div>
                  <span className="text-muted-foreground">User:</span>{" "}
                  <span className="font-semibold">user / user123</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md shadow-2xl border-2">
              <CardHeader className="space-y-1 pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Home className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-center">
                  {t("signIn")}
                </CardTitle>
                <p className="text-sm text-muted-foreground text-center">
                  {t("signInSubtitle")}
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">{t("username")}</Label>
                    <Input
                      id="username"
                      autoComplete="username"
                      placeholder={t("enterUsername")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">{t("password")}</Label>
                      <Link
                        href="/forgot-password"
                        className={cn(
                          "text-xs text-primary hover:underline",
                          loading && "pointer-events-none opacity-50",
                        )}
                      >
                        {t("forgotPassword")}
                      </Link>
                    </div>

                    <div className="relative">
                      <Input
                        id="password"
                        type={showPw ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder={t("enterPassword")}
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

                  {err ? (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {err}
                    </div>
                  ) : null}

                  <Button className="w-full h-11" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("signingIn")}
                      </span>
                    ) : (
                      t("signIn")
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t("orContinueWith")}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11"
                    disabled={loading}
                    onClick={() => {
                      window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"}/api/v1/auth/google`;
                    }}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {t("continueWithGoogle")}
                  </Button>

                  <div className="text-center text-xs text-muted-foreground pt-2">
                    {t("byLoggingIn")}{" "}
                    <Link href="#" className="text-primary hover:underline">
                      {t("termsOfService")}
                    </Link>{" "}
                    {t("and")}{" "}
                    <Link href="#" className="text-primary hover:underline">
                      {t("privacyPolicy")}
                    </Link>
                  </div>

                  <div className="text-center text-sm pt-4 border-t">
                    <span className="text-muted-foreground">
                      {t("dontHaveAccount")}{" "}
                    </span>
                    <Link
                      href="/register"
                      className="font-medium text-primary hover:underline"
                    >
                      {t("registerNow")}
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} {t("footerText")}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PublicSettingsProvider>
      <React.Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </React.Suspense>
    </PublicSettingsProvider>
  );
}
