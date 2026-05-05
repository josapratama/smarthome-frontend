"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import {
  getTrainingJobs,
  type TrainingJob,
} from "@/lib/api/services/ai-training";
import { formatDistanceToNow } from "date-fns";

const LIMIT = 20;

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "running":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}

export function TrainingHistoryTab() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!hasLoaded) loadJobs();
  }, [hasLoaded]);

  useEffect(() => {
    if (hasLoaded) loadJobs();
  }, [page, statusFilter]);

  async function loadJobs() {
    try {
      setLoading(true);
      const params: any = { limit: LIMIT, offset: page * LIMIT };
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await getTrainingJobs(params);
      setJobs(data.jobs);
      setTotal(data.total);
      setHasLoaded(true);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  if (loading && jobs.length === 0) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatus")}</SelectItem>
            <SelectItem value="pending">{t("pending")}</SelectItem>
            <SelectItem value="running">{t("running")}</SelectItem>
            <SelectItem value="completed">{t("completed")}</SelectItem>
            <SelectItem value="failed">{t("failed")}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={loadJobs}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          {t("refresh")}
        </Button>
      </div>

      {/* Table */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("jobId")}</TableHead>
                  <TableHead>{t("modelType")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("progress")}</TableHead>
                  <TableHead>{t("accuracy")}</TableHead>
                  <TableHead>{t("duration")}</TableHead>
                  <TableHead>{t("createdAt")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      {t("noJobs")}
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-sm">
                        #{job.id}
                      </TableCell>
                      <TableCell className="capitalize">
                        {job.modelType}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(job.status)}>
                          {t(job.status as any)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span className="text-xs">{job.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {job.metrics?.accuracy
                          ? `${(job.metrics.accuracy * 100).toFixed(1)}%`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {job.duration
                          ? `${Math.round(job.duration / 60)}m`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(job.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("showing")} {page * LIMIT + 1}–
            {Math.min((page + 1) * LIMIT, total)} {t("of")} {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
