"use client";

import { Shield, Zap, Lock, Activity, Cpu } from "lucide-react";

interface FeaturesSectionProps {
  t: (key: string) => string;
}

export function FeaturesSection({ t }: FeaturesSectionProps) {
  const features = [
    {
      icon: Shield,
      title: t("securePrivate"),
      description: t("secureDesc"),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Zap,
      title: t("realTimeControl"),
      description: t("realTimeDesc"),
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: Lock,
      title: t("roleBasedAccess"),
      description: t("roleBasedDesc"),
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Activity,
      title: t("automation"),
      description: t("automationDesc"),
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Zap,
      title: t("energyMonitoring"),
      description: t("energyMonitoringDesc"),
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Cpu,
      title: t("multiDevice"),
      description: t("multiDeviceDesc"),
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
  ];

  return (
    <section
      id="features"
      className="container mx-auto px-3 xs:px-4 py-8 xs:py-12 sm:py-16 md:py-20 bg-muted/30"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 xs:mb-8 md:mb-12 px-2 xs:px-4">
          {t("features")}
        </h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 md:gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-3.5 xs:p-4 sm:p-5 md:p-6 rounded-xl border bg-card hover:shadow-lg transition-all duration-200"
              >
                <div
                  className={`h-9 w-9 xs:h-10 xs:w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-2.5 xs:mb-3 md:mb-4`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 xs:h-5 xs:w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 ${feature.color}`}
                  />
                </div>
                <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold mb-1.5 xs:mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs xs:text-sm md:text-base text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
