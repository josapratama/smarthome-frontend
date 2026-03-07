"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { getTrainingJobs, type TrainingJob } from "@/lib/api/ai-training";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function TrainingHistoryTab() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const limit = 20;

  useEffect(() => {
    // Only load once when component first mounts
    if (!hasLoaded) {
      loadJobs();
    }
  }, [hasLoaded]);

  useEffect(() => {
    // Reload when filters change, but only if already loaded
    if (hasLoaded) {
      loadJobs();
    }
  }, [page, statusFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit,
        offset: page * limit,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const data = await getTrainingJobs(params);
      setJobs(data.jobs);
      setTotal(data.total);
      setHasLoaded(true);
    } catch (error) {
      // Silently fail on initial load to avoid toast spam
      console.error("Failed to load training jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "running":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="all">{t("allStatus")}</option>
          <option value="pending">{t("pending")}</option>
          <option value="running">{t("running")}</option>
          <option value="completed">{t("completed")}</option>
          <option value="failed">{t("failed")}</option>
        </select>

        <button
          onClick={loadJobs}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {t("refresh")}
        </button>
      </div>

      {/* Jobs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {t("jobId")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {t("modelType")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {t("status")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {t("progress")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {t("accuracy")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {t("duration")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {t("createdAt")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3 text-sm">#{job.id}</td>
                  <td className="px-4 py-3 text-sm capitalize">
                    {job.modelType}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}
                    >
                      {t(job.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{job.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {job.metrics?.accuracy
                      ? `${(job.metrics.accuracy * 100).toFixed(1)}%`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {job.duration ? `${Math.round(job.duration / 60)}m` : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDistanceToNow(new Date(job.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-12 text-gray-500">{t("noJobs")}</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {t("showing")} {page * limit + 1} -{" "}
            {Math.min((page + 1) * limit, total)} {t("of")} {total}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              {t("previous")}
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
