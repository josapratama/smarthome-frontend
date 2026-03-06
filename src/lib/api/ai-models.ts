import { api } from "./client";

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
  // Get all AI models
  getModels: async (params?: {
    isActive?: boolean;
    algorithm?: string;
    modelType?: AIModelType;
    limit?: number;
  }) => {
    const response = await api.get<{ models: AIModel[] }>("/v1/ai-models", {
      params,
    });
    return response.data.models;
  },

  // Get model by name
  getModel: async (name: string) => {
    const response = await api.get<{ model: AIModel }>(`/v1/ai-models/${name}`);
    return response.data.model;
  },

  // Create new model (admin only)
  createModel: async (input: CreateAIModelInput) => {
    const response = await api.post<{ model: AIModel }>("/v1/ai-models", input);
    return response.data.model;
  },

  // Update model (admin only)
  updateModel: async (name: string, input: UpdateAIModelInput) => {
    const response = await api.patch<{ model: AIModel }>(
      `/v1/ai-models/${name}`,
      input,
    );
    return response.data.model;
  },

  // Activate model (admin only)
  activateModel: async (name: string) => {
    const response = await api.post<{ model: AIModel; action?: string }>(
      `/v1/ai-models/${name}/activate`,
    );
    return response.data;
  },

  // Delete model (admin only)
  deleteModel: async (name: string) => {
    const response = await api.delete<{ success: boolean }>(
      `/v1/ai-models/${name}`,
    );
    return response.data.success;
  },

  // Get model performance
  getPerformance: async (params?: {
    modelName?: string;
    deviceId?: number;
    from?: string;
    to?: string;
    limit?: number;
  }) => {
    const response = await api.get<{
      performances: AIModelPerformance[];
    }>("/v1/ai-models/performance", { params });
    return response.data.performances;
  },

  // Compare models
  compareModels: async (params?: {
    algorithms?: string;
    deviceId?: number;
    days?: number;
  }) => {
    const response = await api.get<{ comparison: ModelComparison[] }>(
      "/v1/ai-models/compare",
      { params },
    );
    return response.data.comparison;
  },

  // Get best model for device
  getBestModel: async (deviceId: number, days = 30) => {
    const response = await api.get<BestModelResult>(
      `/v1/devices/${deviceId}/best-model`,
      { params: { days } },
    );
    return response.data;
  },
};
