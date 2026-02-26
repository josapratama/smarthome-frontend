/**
 * Query keys for React Query
 * Centralized query key management
 */

export const qk = {
  // Devices
  devices: {
    all: ["devices"] as const,
    list: (homeId?: number) => ["devices", "list", homeId] as const,
    detail: (deviceId: number) => ["devices", "detail", deviceId] as const,
    telemetry: (deviceId: number) =>
      ["devices", "telemetry", deviceId] as const,
  },

  // Homes
  homes: {
    all: ["homes"] as const,
    list: () => ["homes", "list"] as const,
    detail: (homeId: number) => ["homes", "detail", homeId] as const,
    rooms: (homeId: number) => ["homes", "rooms", homeId] as const,
    devices: (homeId: number) => ["homes", "devices", homeId] as const,
    members: (homeId: number) => ["homes", "members", homeId] as const,
  },

  // Rooms
  rooms: {
    all: ["rooms"] as const,
    detail: (roomId: number) => ["rooms", "detail", roomId] as const,
    devices: (roomId: number) => ["rooms", "devices", roomId] as const,
  },

  // Firmware
  firmware: {
    all: ["firmware"] as const,
    releases: () => ["firmware", "releases"] as const,
    detail: (releaseId: number) => ["firmware", "detail", releaseId] as const,
  },

  // OTA
  ota: {
    all: ["ota"] as const,
    jobs: () => ["ota", "jobs"] as const,
    job: (jobId: number) => ["ota", "job", jobId] as const,
    deviceJobs: (deviceId: number) => ["ota", "device", deviceId] as const,
  },

  // Alarms
  alarms: {
    all: ["alarms"] as const,
    list: (homeId?: number) => ["alarms", "list", homeId] as const,
    detail: (alarmId: number) => ["alarms", "detail", alarmId] as const,
  },

  // Commands
  commands: {
    all: ["commands"] as const,
    list: (deviceId?: number) => ["commands", "list", deviceId] as const,
    detail: (commandId: number) => ["commands", "detail", commandId] as const,
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
    endpoints: () => ["notifications", "endpoints"] as const,
    logs: () => ["notifications", "logs"] as const,
  },

  // Invites
  invites: {
    all: ["invites"] as const,
    list: (homeId?: number) => ["invites", "list", homeId] as const,
  },

  // Monitoring
  monitoring: {
    all: ["monitoring"] as const,
    overview: () => ["monitoring", "overview"] as const,
  },

  // Overview/Dashboard
  overview: {
    all: ["overview"] as const,
    dashboard: () => ["overview", "dashboard"] as const,
  },

  // User Preferences
  preferences: {
    all: ["preferences"] as const,
    user: () => ["user", "preferences"] as const,
  },
};
