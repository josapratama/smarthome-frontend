"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetchBrowser } from "@/lib/api/client/fetch";
import type {
  UserPreferencesDTO,
  PreferencesResponse,
  PreferencesUpdateResponse,
} from "@/lib/api/dto/preferences.dto";

const PREFERENCES_KEY = ["user", "preferences"];

/**
 * Hook for managing user preferences
 * Combines localStorage (fast) with backend sync (cross-device)
 */
export function usePreferences() {
  const queryClient = useQueryClient();

  // Fetch from backend
  const query = useQuery({
    queryKey: PREFERENCES_KEY,
    queryFn: async () => {
      const response = await apiFetchBrowser<PreferencesResponse>(
        "/api/v1/preferences",
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update preferences (partial)
  const updateMutation = useMutation({
    mutationFn: async (preferences: Partial<UserPreferencesDTO>) => {
      console.log("Updating preferences via API:", preferences);
      const response = await apiFetchBrowser<PreferencesUpdateResponse>(
        "/api/v1/preferences",
        {
          method: "PATCH",
          body: JSON.stringify(preferences),
        },
      );
      console.log("API response:", response);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Update successful, new data:", data);
      queryClient.setQueryData(PREFERENCES_KEY, data);
      // Also update localStorage for immediate access
      if (typeof window !== "undefined") {
        localStorage.setItem("user-preferences", JSON.stringify(data));
        console.log("Updated localStorage:", data);
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event("preferences-changed"));
        console.log("Dispatched preferences-changed event");
      }
    },
    onError: (error) => {
      console.error("Failed to update preferences:", error);
    },
  });

  // Replace all preferences
  const replaceMutation = useMutation({
    mutationFn: async (preferences: UserPreferencesDTO) => {
      const response = await apiFetchBrowser<PreferencesUpdateResponse>(
        "/api/v1/preferences",
        {
          method: "PUT",
          body: JSON.stringify(preferences),
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(PREFERENCES_KEY, data);
      if (typeof window !== "undefined") {
        localStorage.setItem("user-preferences", JSON.stringify(data));
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event("preferences-changed"));
      }
    },
  });

  // Reset to defaults
  const resetMutation = useMutation({
    mutationFn: async () => {
      await apiFetchBrowser("/api/v1/preferences", {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREFERENCES_KEY });
      if (typeof window !== "undefined") {
        localStorage.removeItem("user-preferences");
      }
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updatePreferences: updateMutation.mutate,
    replacePreferences: replaceMutation.mutate,
    resetPreferences: resetMutation.mutate,
    isUpdating:
      updateMutation.isPending ||
      replaceMutation.isPending ||
      resetMutation.isPending,
  };
}

/**
 * Get preferences from localStorage (synchronous, no API call)
 * Useful for immediate access before React Query loads
 */
export function getLocalPreferences(): UserPreferencesDTO | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem("user-preferences");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Set preferences in localStorage only (no backend sync)
 * Useful for guest users or offline mode
 */
export function setLocalPreferences(preferences: UserPreferencesDTO) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("user-preferences", JSON.stringify(preferences));
  } catch (error) {
    console.error("Failed to save preferences to localStorage:", error);
  }
}
