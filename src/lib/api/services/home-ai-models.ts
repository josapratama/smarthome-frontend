import { apiFetchBrowser } from "../client/fetch";

export interface HomeAIModel {
  id: number;
  homeId: number;
  modelType: string;
  modelName: string;
  createdAt: string;
  updatedAt: string;
  model: {
    id: number;
    name: string;
    version: string;
    modelType: string;
    algorithm: string;
    parameters: any;
    isActive: boolean;
    description: string | null;
    totalPredictions: number;
    avgAccuracy: number;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export interface ActiveModelForHome {
  model: {
    id: number;
    name: string;
    version: string;
    modelType: string;
    algorithm: string;
    parameters: any;
    isActive: boolean;
    description: string | null;
    totalPredictions: number;
    avgAccuracy: number;
    createdAt: string;
    updatedAt: string;
  };
  source: "home" | "global";
}

export async function getHomeModels(homeId: number): Promise<HomeAIModel[]> {
  const response = await apiFetchBrowser<{
    data: { homeModels: HomeAIModel[] };
  }>(`/api/v1/homes/${homeId}/ai-models`);
  return response.data.homeModels;
}

export async function setHomeModel(
  homeId: number,
  modelType: "prediction" | "anomaly",
  modelName: string,
): Promise<void> {
  await apiFetchBrowser(`/api/v1/homes/${homeId}/ai-models`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modelType, modelName }),
  });
}

export async function removeHomeModel(
  homeId: number,
  modelType: "prediction" | "anomaly",
): Promise<void> {
  await apiFetchBrowser(`/api/v1/homes/${homeId}/ai-models/${modelType}`, {
    method: "DELETE",
  });
}

export async function getActiveModelForHome(
  homeId: number,
  modelType: "prediction" | "anomaly",
): Promise<ActiveModelForHome> {
  const response = await apiFetchBrowser<{ data: ActiveModelForHome }>(
    `/api/v1/homes/${homeId}/ai-models/${modelType}/active`,
  );
  return response.data;
}

export async function applyModelToAllHomes(
  modelType: "prediction" | "anomaly",
  modelName?: string,
): Promise<{ appliedCount?: number; deletedCount?: number }> {
  const response = await apiFetchBrowser<{
    data: { appliedCount?: number; deletedCount?: number };
  }>(`/api/v1/ai-models/apply-to-all-homes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modelType, modelName }),
  });
  return response.data;
}
