import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";

function extractMsg(payload: unknown): string | null {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (typeof p.message === "string") return p.message;
  if (typeof p.error === "string") return p.error;
  return null;
}

interface DashboardErrorViewProps {
  status?: number;
  payload?: unknown;
}

export function DashboardErrorView({
  status,
  payload,
}: DashboardErrorViewProps) {
  const { t } = useTranslation();
  const msg = extractMsg(payload);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{t("failedLoadDashboard")}</h1>
        <p className="text-sm text-muted-foreground">
          {status ? `HTTP ${status}` : t("unknownError")}
          {msg ? ` • ${msg}` : ""}
        </p>
      </div>

      {payload !== undefined && (
        <pre className="text-xs whitespace-pre-wrap rounded-xl border bg-muted/30 p-4">
          {typeof payload === "string"
            ? payload
            : JSON.stringify(payload, null, 2)}
        </pre>
      )}

      {status === 401 && (
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/login">{t("goToLogin")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">{t("home")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
