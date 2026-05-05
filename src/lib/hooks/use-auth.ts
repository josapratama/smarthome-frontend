import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../api/services";
import { useAuthStore } from "../store/auth";
import type { LoginRequest, RegisterRequest } from "../types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, setUser, logout: clearAuth } = useAuthStore();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getCurrentUser,
    enabled: !!user,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(["auth", "me"], data.user);
      router.push("/dashboard");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterRequest) => authApi.register(userData),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(["auth", "me"], data.user);
      router.push("/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    user: currentUser || user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
