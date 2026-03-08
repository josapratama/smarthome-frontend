"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowLeft, KeyRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthRedirect } from "@/components/landing/auth-redirect";

function ResetPasswordForm() {
  const router = useRouter();
  const sp = useSearchParams();

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
      setErr("Token reset wajib diisi.");
      return;
    }
    if (password.length < 8) {
      setErr("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setErr("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // sesuaikan payload dengan BE kamu
        body: JSON.stringify({ token: token.trim(), newPassword: password }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        setErr(payload?.message ?? "Gagal reset password");
        return;
      }

      setDone(true);
    } catch {
      setErr("Network error. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/40">
      <AuthRedirect />
      <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center p-6">
        <Card className="w-full rounded-2xl shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Reset Password</CardTitle>
            <p className="text-sm text-muted-foreground">
              Masukkan token reset dan password baru.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {done ? (
              <div className="space-y-4">
                <div className="rounded-xl border bg-card p-4">
                  <div className="flex items-center gap-2 font-medium">
                    <KeyRound className="h-4 w-4" />
                    Password berhasil diubah
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Silakan login menggunakan password baru.
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => router.push("/login")}
                >
                  Ke halaman login
                </Button>

                <div className="text-center text-xs text-muted-foreground">
                  Jika masih bermasalah, minta reset ulang dari menu lupa
                  password.
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Token reset</Label>
                  <Input
                    id="token"
                    placeholder="paste token dari email"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <div className="text-xs text-muted-foreground">
                    Token biasanya ada di link email. Contoh:{" "}
                    <span className="font-mono">/reset-password?token=...</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password baru</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="minimal 8 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                      className="pr-10"
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
                  <Label htmlFor="confirm">Konfirmasi password</Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="ulang password baru"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      disabled={loading}
                      required
                      className="pr-10"
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
                    <div className="text-xs text-red-600">
                      Konfirmasi tidak sama.
                    </div>
                  ) : null}
                </div>

                {err ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {err}
                  </div>
                ) : null}

                <Button className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses...
                    </span>
                  ) : (
                    "Reset password"
                  )}
                </Button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke login
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
