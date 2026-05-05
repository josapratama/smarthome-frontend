"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AdminProfile {
  username: string;
  email: string;
  avatarUrl?: string;
}

interface AdminProfileContextType {
  profile: AdminProfile | null;
  isLoading: boolean;
}

const AdminProfileContext = createContext<AdminProfileContextType>({
  profile: null,
  isLoading: true,
});

export function AdminProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("UNAUTHORIZED");
        return res.json();
      })
      .then((result) => setProfile(result.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AdminProfileContext.Provider value={{ profile, isLoading }}>
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminProfile() {
  return useContext(AdminProfileContext);
}
