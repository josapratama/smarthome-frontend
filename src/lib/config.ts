/**
 * Centralized configuration for frontend application
 * All environment variables should be accessed through this file
 */

export const config = {
  /**
   * Backend API URL
   * Used for server-side API calls
   */
  backendUrl: process.env.BACKEND_URL || "http://localhost:3000",

  /**
   * Backend API URL for client-side calls
   * Must be prefixed with NEXT_PUBLIC_ to be available in browser
   */
  publicBackendUrl:
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000",

  /**
   * Frontend URL
   * Used for redirects and callbacks
   */
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001",

  /**
   * API prefix for backend routes
   */
  apiPrefix: "/api/v1",

  /**
   * Environment
   */
  env: process.env.NODE_ENV || "development",

  /**
   * Is production environment
   */
  isProduction: process.env.NODE_ENV === "production",

  /**
   * Is development environment
   */
  isDevelopment: process.env.NODE_ENV === "development",
} as const;

/**
 * Helper to get full backend API URL
 */
export function getBackendUrl(path: string = ""): string {
  const baseUrl = config.backendUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Helper to get full backend API URL for client-side
 */
export function getPublicBackendUrl(path: string = ""): string {
  const baseUrl = config.publicBackendUrl;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Helper to get full API v1 URL
 */
export function getApiUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return getBackendUrl(`${config.apiPrefix}/${cleanPath}`);
}

/**
 * Helper to get full API v1 URL for client-side
 */
export function getPublicApiUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return getPublicBackendUrl(`${config.apiPrefix}/${cleanPath}`);
}
