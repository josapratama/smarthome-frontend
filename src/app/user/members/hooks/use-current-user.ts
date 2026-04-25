"use client";

import { useState, useEffect } from "react";

export function useCurrentUser() {
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (res.ok && data.data) {
          setCurrentUserId(data.data.id);
        }
      } catch (error) {
        console.error("Failed to load current user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  return { currentUserId, isLoading };
}
