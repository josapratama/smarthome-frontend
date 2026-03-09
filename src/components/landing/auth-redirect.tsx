"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect if user is on public pages
    if (pathname?.startsWith("/public")) {
      return;
    }

    // Get cookies using native browser API
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const token = getCookie("access_token");
    const userRole = getCookie("user_role");

    if (token && userRole) {
      // Redirect based on role
      if (userRole === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/user/dashboard");
      }
    }
  }, [router, pathname]);

  return null; // This component doesn't render anything
}
