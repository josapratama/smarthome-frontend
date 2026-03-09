import { apiFetchBrowser } from "../client/fetch";

export type FAQCategory =
  | "GENERAL"
  | "DEVICES"
  | "AI_MODELS"
  | "ENERGY"
  | "ALARMS"
  | "AUTOMATION"
  | "ACCOUNT"
  | "TROUBLESHOOTING";

export interface FAQ {
  id: number;
  category: FAQCategory;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
  tags: string[];
  searchTerms: string | null;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: number;
    username: string;
  };
}

export interface CreateFAQInput {
  category: FAQCategory;
  question: string;
  answer: string;
  order?: number;
  tags?: string[];
  searchTerms?: string;
  isPublished?: boolean;
}

export interface UpdateFAQInput {
  category?: FAQCategory;
  question?: string;
  answer?: string;
  order?: number;
  tags?: string[];
  searchTerms?: string;
  isPublished?: boolean;
}

export async function getFAQs(params?: {
  category?: FAQCategory;
  search?: string;
  isPublished?: boolean;
  limit?: number;
}): Promise<FAQ[]> {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append("category", params.category);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.isPublished !== undefined)
    queryParams.append("isPublished", String(params.isPublished));
  if (params?.limit) queryParams.append("limit", String(params.limit));

  const response = await apiFetchBrowser<{ data: { faqs: FAQ[] } }>(
    `/api/v1/faq?${queryParams}`,
  );
  return response.data.faqs;
}

export async function getFAQ(id: number): Promise<FAQ> {
  const response = await apiFetchBrowser<{ data: { faq: FAQ } }>(
    `/api/v1/faq/${id}`,
  );
  return response.data.faq;
}

export async function createFAQ(data: CreateFAQInput): Promise<FAQ> {
  const response = await apiFetchBrowser<{ data: { faq: FAQ } }>(
    "/api/v1/faq",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  return response.data.faq;
}

export async function updateFAQ(
  id: number,
  data: UpdateFAQInput,
): Promise<FAQ> {
  const response = await apiFetchBrowser<{ data: { faq: FAQ } }>(
    `/api/v1/faq/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );
  return response.data.faq;
}

export async function deleteFAQ(id: number): Promise<void> {
  await apiFetchBrowser(`/api/v1/faq/${id}`, {
    method: "DELETE",
  });
}

export async function markFAQFeedback(
  id: number,
  helpful: boolean,
): Promise<void> {
  await apiFetchBrowser(`/api/v1/faq/${id}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ helpful }),
  });
}

export async function getCategories(): Promise<
  Array<{ category: string; count: number }>
> {
  const response = await apiFetchBrowser<{
    data: { categories: Array<{ category: string; count: number }> };
  }>("/api/v1/faq/categories");
  return response.data.categories;
}
