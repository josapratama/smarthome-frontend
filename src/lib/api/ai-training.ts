import { api } from "./client";

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
  const response = await api.get("/v1/ai/training/config");
  return response.data.data;
}

/**
 * Update training configuration
 */
export async function updateTrainingConfig(
  config: TrainingConfig,
): Promise<TrainingConfig> {
  const response = await api.put("/v1/ai/training/config", config);
  return response.data.data;
}

/**
 * Start manual training
 */
export async function startTraining(params: {
  modelType: "prediction" | "anomaly" | "both";
  deviceId?: number;
}): Promise<{ jobId: number; status: string }> {
  const response = await api.post("/v1/ai/training/start", params);
  return response.data.data;
}

/**
 * Get training job history
 */
export async function getTrainingJobs(params?: {
  limit?: number;
  offset?: number;
  status?: "pending" | "running" | "completed" | "failed";
}): Promise<{ jobs: TrainingJob[]; total: number }> {
  const response = await api.get("/v1/ai/training/jobs", { params });
  return response.data.data;
}

/**
 * Get specific training job details
 */
export async function getTrainingJob(jobId: number): Promise<TrainingJob> {
  const response = await api.get(`/v1/ai/training/jobs/${jobId}`);
  return response.data.data;
}

/**
 * Get training statistics
 */
export async function getTrainingStats(): Promise<TrainingStats> {
  const response = await api.get("/v1/ai/training/stats");
  return response.data.data;
}
