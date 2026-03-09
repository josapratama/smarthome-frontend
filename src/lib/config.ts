/**
 * Application configuration
 * Centralized configuration for environment variables and app settings
 */

export const config = {
  /**
   * API Configuration
   */
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    timeout: 30000, // 30 seconds
  },

  /**
   * App Information
   */
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Smart Home",
    version: "1.0.0",
  },

  /**
   * Feature Flags
   */
  features: {
    enableGoogleAuth: true,
    enableNotifications: true,
    enableAI: true,
  },

  /**
   * WebSocket Configuration
   */
  websocket: {
    url: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000",
    reconnectInterval: 5000, // 5 seconds
    maxReconnectAttempts: 5,
  },
} as const;

export type Config = typeof config;
