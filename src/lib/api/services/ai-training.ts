import { apiFetchBrowser } from "../client/fetch";

// ===== TYPES =====

export interface TrainingConfig {
  schedule: "manual" | "hourly" | "daily" | "weekly" | "monthly";
  autoRetrain: boolean;
  minDataPoints: number;
  accuracyThreshold: number;
  batchSize: number;
  epochs: number;
  learningRate: number;
}

export interface TrainingJob {
  id: number;
  modelType: "prediction" | "anomaly";
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  metrics?: {
    accuracy?: number;
    loss?: number;
    valAccuracy?: number;
    valLoss?: number;
  };
  error: string | null;
  createdBy: number;
  createdAt: string;
}

export interface TrainingStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  runningJobs: number;
  avgDuration: number;
  avgAccuracy: number;
  lastTraining: string | null;
  nextScheduled: string | null;
}

// ===== API FUNCTIONS =====

/**
 * Get current training configuration
 */
export async function getTrainingConfig(): Promise<TrainingConfig> {
  const response = await apiFetchBrowser<{ data: TrainingConfig }>(
    "/api/v1/ai/training/config",
  );
  return response.data;
}

export async function updateTrainingConfig(
  config: TrainingConfig,
): Promise<TrainingConfig> {
  const response = await apiFetchBrowser<{ data: TrainingConfig }>(
    "/api/v1/ai/training/config",
    {
      method: "PUT",
      body: JSON.stringify(config),
    },
  );
  return response.data;
}

export async function startTraining(params: {
  modelType: "prediction" | "anomaly" | "both";
  deviceId?: number;
}): Promise<{ jobId: number; status: string }> {
  const response = await apiFetchBrowser<{
    data: { jobId: number; status: string };
  }>("/api/v1/ai/training/start", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return response.data;
}

export async function getTrainingJobs(params?: {
  limit?: number;
  offset?: number;
  status?: "pending" | "running" | "completed" | "failed";
}): Promise<{ jobs: TrainingJob[]; total: number }> {
  const p = new URLSearchParams();
  if (params?.limit) p.append("limit", String(params.limit));
  if (params?.offset) p.append("offset", String(params.offset));
  if (params?.status) p.append("status", params.status);
  const response = await apiFetchBrowser<{
    data: { jobs: TrainingJob[]; total: number };
  }>(`/api/v1/ai/training/jobs?${p.toString()}`);
  return response.data;
}

export async function getTrainingJob(jobId: number): Promise<TrainingJob> {
  const response = await apiFetchBrowser<{ data: TrainingJob }>(
    `/api/v1/ai/training/jobs/${jobId}`,
  );
  return response.data;
}

export async function getTrainingStats(): Promise<TrainingStats> {
  const response = await apiFetchBrowser<{ data: TrainingStats }>(
    "/api/v1/ai/training/stats",
  );
  return response.data;
}
