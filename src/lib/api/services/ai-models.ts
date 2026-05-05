import { apiFetchBrowser } from "../client/fetch";

// ===== TYPES =====

export type AIModelType = "prediction" | "anomaly";

export type AIModelAlgorithm =
  | "moving_average"
  | "linear_regression"
  | "seasonal_decomposition"
  | "isolation_forest"
  | "one_class_svm"
  | "local_outlier_factor";

export interface AIModel {
  id: number;
  name: string;
  version: string;
  modelType: AIModelType;
  algorithm: AIModelAlgorithm;
  parameters: Record<string, any>;
  isActive: boolean;
  description: string | null;
  totalPredictions: number;
  avgAccuracy: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIModelPerformance {
  id: number;
  modelName: string;
  deviceId: number;
  accuracy: number;
  predictionDate: string;
  recordedAt: string;
  device: {
    id: number;
    deviceName: string;
    deviceType: string;
  };
}

export interface ModelComparison {
  modelName: string;
  totalPredictions: number;
  avgAccuracy: number;
  minAccuracy: number;
  maxAccuracy: number;
}

export interface BestModelResult {
  model: AIModel;
  avgAccuracy: number;
  totalPredictions: number;
}

export interface CreateAIModelInput {
  name: string;
  version: string;
  modelType?: AIModelType;
  algorithm: AIModelAlgorithm;
  parameters: Record<string, any>;
  description?: string;
}

export interface UpdateAIModelInput {
  version?: string;
  algorithm?: AIModelAlgorithm;
  parameters?: Record<string, any>;
  description?: string;
  isActive?: boolean;
}

// ===== API FUNCTIONS =====

export const aiModelsApi = {
  getModels: async (params?: {
    isActive?: boolean;
    algorithm?: string;
    modelType?: AIModelType;
    limit?: number;
  }) => {
    const p = new URLSearchParams();
    if (params?.isActive !== undefined)
      p.append("isActive", String(params.isActive));
    if (params?.algorithm) p.append("algorithm", params.algorithm);
    if (params?.modelType) p.append("modelType", params.modelType);
    if (params?.limit) p.append("limit", String(params.limit));
    const res = await apiFetchBrowser<{ models: AIModel[] }>(
      `/api/v1/ai-models?${p.toString()}`,
    );
    return res.models;
  },

  getModel: async (name: string) => {
    const res = await apiFetchBrowser<{ model: AIModel }>(
      `/api/v1/ai-models/${name}`,
    );
    return res.model;
  },

  createModel: async (input: CreateAIModelInput) => {
    const res = await apiFetchBrowser<{ model: AIModel }>("/api/v1/ai-models", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.model;
  },

  updateModel: async (name: string, input: UpdateAIModelInput) => {
    const res = await apiFetchBrowser<{ model: AIModel }>(
      `/api/v1/ai-models/${name}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    );
    return res.model;
  },

  activateModel: async (name: string) => {
    const res = await apiFetchBrowser<{ model: AIModel; action?: string }>(
      `/api/v1/ai-models/${name}/activate`,
      {
        method: "POST",
      },
    );
    return res;
  },

  deleteModel: async (name: string) => {
    const res = await apiFetchBrowser<{ success: boolean }>(
      `/api/v1/ai-models/${name}`,
      { method: "DELETE" },
    );
    return res.success;
  },

  getPerformance: async (params?: {
    modelName?: string;
    deviceId?: number;
    from?: string;
    to?: string;
    limit?: number;
  }) => {
    const p = new URLSearchParams();
    if (params?.modelName) p.append("modelName", params.modelName);
    if (params?.deviceId) p.append("deviceId", String(params.deviceId));
    if (params?.from) p.append("from", params.from);
    if (params?.to) p.append("to", params.to);
    if (params?.limit) p.append("limit", String(params.limit));
    const res = await apiFetchBrowser<{ performances: AIModelPerformance[] }>(
      `/api/v1/ai-models/performance?${p.toString()}`,
    );
    return res.performances;
  },

  compareModels: async (params?: {
    algorithms?: string;
    deviceId?: number;
    days?: number;
  }) => {
    const p = new URLSearchParams();
    if (params?.algorithms) p.append("algorithms", params.algorithms);
    if (params?.deviceId) p.append("deviceId", String(params.deviceId));
    if (params?.days) p.append("days", String(params.days));
    const res = await apiFetchBrowser<{ comparison: ModelComparison[] }>(
      `/api/v1/ai-models/compare?${p.toString()}`,
    );
    return res.comparison;
  },

  getBestModel: async (deviceId: number, days = 30) => {
    const res = await apiFetchBrowser<BestModelResult>(
      `/api/v1/devices/${deviceId}/best-model?days=${days}`,
    );
    return res;
  },
};
