"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home as HomeIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export function GettingStartedCard() {
  const { t } = useTranslation();

  const steps = [
    t("createHomeAddRooms") || "Create a home and add rooms",
    t("pairESP32Devices") || "Pair your ESP32 IoT devices",
    t("monitorRealTimeTelemetry") || "Monitor real-time telemetry",
    t("controlDevicesRemotely") || "Control devices remotely",
  ];

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="text-6xl">🏠</div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg md:text-xl font-bold mb-2">
              {t("getStartedSmartHome") || "Get Started with Smart Home"}
            </h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground mb-4">
              {steps.map((step, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  {step}
                </li>
              ))}
            </ul>
            <Link href="/user/locations">
              <Button size="lg" className="gap-2">
                <HomeIcon className="h-4 w-4" />
                {t("createFirstHome") || "Create Your First Home"}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
