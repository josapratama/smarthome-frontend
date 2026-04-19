"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/use-translation";
import {
  getTrainingStats,
  type TrainingStats,
} from "@/lib/api/services/ai-training";
import { formatDistanceToNow } from "date-fns";

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
}

function StatCard({ label, value, color = "" }: StatCardProps) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

function ProgressBar({ label, value, total, color }: ProgressBarProps) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function TrainingAnalyticsTab() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [stats, setStats] = useState<TrainingStats | null>(null);

  useEffect(() => {
    if (!hasLoaded) loadStats();
  }, [hasLoaded]);

  async function loadStats() {
    try {
      setLoading(true);
      const data = await getTrainingStats();
      setStats(data);
      setHasLoaded(true);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("noStats")}
      </div>
    );
  }

  const successRate =
    stats.totalJobs > 0
      ? ((stats.completedJobs / stats.totalJobs) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Job counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={t("totalJobs")} value={stats.totalJobs} />
        <StatCard
          label={t("completedJobs")}
          value={stats.completedJobs}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          label={t("failedJobs")}
          value={stats.failedJobs}
          color="text-red-600 dark:text-red-400"
        />
        <StatCard
          label={t("runningJobs")}
          value={stats.runningJobs}
          color="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* Performance metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label={t("avgAccuracy")}
          value={`${(stats.avgAccuracy * 100).toFixed(1)}%`}
        />
        <StatCard
          label={t("avgDuration")}
          value={`${Math.round(stats.avgDuration / 60)}m`}
        />
        <StatCard label={t("successRate")} value={`${successRate}%`} />
      </div>

      {/* Timeline */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("timeline")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {t("lastTraining")}
            </span>
            <span className="text-sm font-medium">
              {stats.lastTraining
                ? formatDistanceToNow(new Date(stats.lastTraining), {
                    addSuffix: true,
                  })
                : t("never")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {t("nextScheduled")}
            </span>
            <span className="text-sm font-medium">
              {stats.nextScheduled
                ? formatDistanceToNow(new Date(stats.nextScheduled), {
                    addSuffix: true,
                  })
                : t("notScheduled")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Job distribution */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("jobDistribution")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ProgressBar
            label={t("completed")}
            value={stats.completedJobs}
            total={stats.totalJobs}
            color="bg-green-600"
          />
          <ProgressBar
            label={t("failed")}
            value={stats.failedJobs}
            total={stats.totalJobs}
            color="bg-red-600"
          />
          <ProgressBar
            label={t("running")}
            value={stats.runningJobs}
            total={stats.totalJobs}
            color="bg-blue-600"
          />
        </CardContent>
      </Card>
    </div>
  );
}
