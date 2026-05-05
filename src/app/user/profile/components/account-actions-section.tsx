"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AccountActionsSection() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
      toast.error(t("failedToLogout"));
    }
  };

  return (
    <Card className="rounded-2xl shadow-sm border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("accountActions")}</CardTitle>
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
  );
}
