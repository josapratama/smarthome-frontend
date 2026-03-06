"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
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
  }, [router]);

  return null; // This component doesn't render anything
}
