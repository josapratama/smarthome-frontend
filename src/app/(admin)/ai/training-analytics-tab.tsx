"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { getTrainingStats, type TrainingStats } from "@/lib/api/ai-training";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function TrainingAnalyticsTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [stats, setStats] = useState<TrainingStats | null>(null);

  useEffect(() => {
    // Only load once when component first mounts
    if (!hasLoaded) {
      loadStats();
    }
  }, [hasLoaded]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getTrainingStats();
      setStats(data);
      setHasLoaded(true);
    } catch (error) {
      // Silently fail on initial load to avoid toast spam
      console.error("Failed to load training stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">{t("noStats")}</div>
    );
  }

  const successRate =
    stats.totalJobs > 0
      ? ((stats.completedJobs / stats.totalJobs) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {t("totalJobs")}
          </div>
          <div className="text-3xl font-bold">{stats.totalJobs}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {t("completedJobs")}
          </div>
          <div className="text-3xl font-bold text-green-600">
            {stats.completedJobs}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {t("failedJobs")}
          </div>
          <div className="text-3xl font-bold text-red-600">
            {stats.failedJobs}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {t("runningJobs")}
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.runningJobs}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {t("avgAccuracy")}
          </div>
          <div className="text-3xl font-bold">
            {(stats.avgAccuracy * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {t("avgDuration")}
          </div>
          <div className="text-3xl font-bold">
            {Math.round(stats.avgDuration / 60)}m
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {t("successRate")}
          </div>
          <div className="text-3xl font-bold">{successRate}%</div>
        </div>
      </div>

      {/* Training Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{t("timeline")}</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
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
            <span className="text-sm text-gray-600 dark:text-gray-400">
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
        </div>
      </div>

      {/* Success Rate Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{t("jobDistribution")}</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{t("completed")}</span>
              <span className="font-medium">{stats.completedJobs}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${(stats.completedJobs / stats.totalJobs) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{t("failed")}</span>
              <span className="font-medium">{stats.failedJobs}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{
                  width: `${(stats.failedJobs / stats.totalJobs) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{t("running")}</span>
              <span className="font-medium">{stats.runningJobs}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(stats.runningJobs / stats.totalJobs) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
