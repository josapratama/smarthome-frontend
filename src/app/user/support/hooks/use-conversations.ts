"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import {
  getDMConversations,
  getHomeConversations,
  getDMUnreadCount,
  getHomeUnreadCount,
  type DirectConversation,
  type HomeConversation,
} from "@/lib/api/services/messaging";

const REFRESH_INTERVAL_MS = 30_000;

export function useConversations() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"dm" | "home">("dm");
  const [dmConversations, setDmConversations] = useState<DirectConversation[]>(
    [],
  );
  const [homeConversations, setHomeConversations] = useState<
    HomeConversation[]
  >([]);
  const [selectedConversation, setSelectedConversation] = useState<
    DirectConversation | HomeConversation | null
  >(null);
  const [dmUnreadCount, setDmUnreadCount] = useState(0);
  const [homeUnreadCount, setHomeUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dmData, homeData] = await Promise.all([
        getDMConversations().catch(() => []),
        getHomeConversations().catch(() => []),
      ]);
      setDmConversations(dmData);
      setHomeConversations(homeData);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUnreadCounts = useCallback(async () => {
    try {
      const [dmCount, homeCount] = await Promise.all([
        getDMUnreadCount().catch(() => 0),
        getHomeUnreadCount().catch(() => 0),
      ]);
      setDmUnreadCount(dmCount);
      setHomeUnreadCount(homeCount);
    } catch (error) {
      console.error("Failed to load unread counts:", error);
    }
  }, []);

  const refresh = useCallback(() => {
    loadConversations();
    loadUnreadCounts();
  }, [loadConversations, loadUnreadCounts]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  // Focus search input on topbar-search event
  useEffect(() => {
    const handleSearch = () => {
      const input =
        searchSectionRef.current?.querySelector("input") ??
        (document.querySelector("input") as HTMLInputElement | null);
      input?.focus();
      input?.select();
    };
    window.addEventListener("topbar-search", handleSearch);
    return () => window.removeEventListener("topbar-search", handleSearch);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value as "dm" | "home");
    setSelectedConversation(null);
  };

  const filteredDmConversations = searchQuery
    ? dmConversations.filter(({ otherUser }) => {
        const q = searchQuery.toLowerCase();
        return (
          otherUser.email?.toLowerCase().includes(q) ||
          otherUser.username?.toLowerCase().includes(q)
        );
      })
    : dmConversations;

  const filteredHomeConversations = searchQuery
    ? homeConversations.filter(({ home }) =>
        home.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : homeConversations;

  return {
    activeTab,
    handleTabChange,
    dmConversations,
    homeConversations,
    filteredDmConversations,
    filteredHomeConversations,
    selectedConversation,
    setSelectedConversation,
    dmUnreadCount,
    homeUnreadCount,
    isLoading,
    searchQuery,
    setSearchQuery,
    searchSectionRef,
    refresh,
  };
}
