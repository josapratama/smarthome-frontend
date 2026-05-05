// User & Authentication
export interface User {
  id: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Home
export interface Home {
  id: number;
  ownerUserId: number;
  name: string;
  addressText?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    devices: number;
    rooms: number;
    members: number;
  };
}

export interface HomeMember {
  id: number;
  homeId: number;
  userId: number;
  roleInHome: "OWNER" | "MEMBER" | "GUEST";
  status: "INVITED" | "ACTIVE" | "REVOKED";
  invitedAt: string;
  joinedAt?: string;
  user: User;
}

// Room
export interface Room {
  id: number;
  homeId: number;
  name: string;
  createdAt: string;
  _count?: {
    devices: number;
  };
}

// Device
export type DeviceType =
  | "LIGHT"
  | "FAN"
  | "BELL"
  | "DOOR"
  | "SENSOR_NODE"
  | "POWER_METER"
  | "OTHER";

export interface Device {
  id: number;
  deviceName: string;
  roomId?: number;
  status: boolean;
  updatedAt: string;
  lastSeenAt?: string;
  deviceType: DeviceType;
  capabilities?: Record<string, any>;
  homeId: number;
  room?: Room;
  _count?: {
    sensorData: number;
  };
}

// Sensor Data
export interface SensorData {
  id: number;
  deviceId: number;
  current: number;
  gasPpm: number;
  flame: boolean;
  binLevel: number;
  powerW?: number;
  energyKwh?: number;
  voltageV?: number;
  currentA?: number;
  frequencyHz?: number;
  powerFactor?: number;
  distanceCm?: number;
  timestamp: string;
}

// Alarm
export type AlarmSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlarmStatus = "OPEN" | "ACKED" | "RESOLVED";
export type AlarmSource = "DEVICE" | "BACKEND" | "AI" | "USER";

export interface AlarmEvent {
  id: number;
  deviceId: number;
  homeId: number;
  type: string;
  message: string;
  severity: AlarmSeverity;
  source: AlarmSource;
  triggeredAt: string;
  status: AlarmStatus;
  acknowledgedAt?: string;
  resolvedAt?: string;
  device?: Device;
}

// Command
export type CommandStatus = "PENDING" | "SENT" | "ACKED" | "FAILED" | "TIMEOUT";

export interface Command {
  id: number;
  deviceId: number;
  type: string;
  payload: Record<string, any>;
  status: CommandStatus;
  createdAt: string;
  device?: Device;
}

// Energy
export interface EnergyPrediction {
  id: number;
  deviceId: number;
  predictedEnergy: number;
  actualEnergy?: number;
  windowStart?: string;
  windowEnd?: string;
  modelVersion?: string;
  createdAt: string;
}

export interface EnergyUsageDaily {
  id: number;
  deviceId: number;
  homeId?: number;
  usageDate: string;
  energyKwh: number;
  avgPowerW?: number;
  peakPowerW?: number;
  createdAt: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalDevices: number;
  activeDevices: number;
  offlineDevices: number;
  totalRooms: number;
  openAlarms: number;
  criticalAlarms: number;
  todayEnergy: number;
  yesterdayEnergy: number;
  monthlyEnergy: number;
  estimatedCost: number;
}

export interface DeviceStats {
  online: number;
  offline: number;
  byType: Record<DeviceType, number>;
  byRoom: Array<{
    roomId: number;
    roomName: string;
    deviceCount: number;
  }>;
}

export interface EnergyStats {
  today: number;
  yesterday: number;
  thisWeek: number;
  thisMonth: number;
  trend: "up" | "down" | "stable";
  percentageChange: number;
  dailyAverage: number;
  peakHour: number;
  estimatedMonthlyCost: number;
}

export interface AlarmStats {
  total: number;
  open: number;
  acknowledged: number;
  resolved: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recent: AlarmEvent[];
}

// API Response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query Params
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DeviceFilters extends PaginationParams {
  homeId?: number;
  roomId?: number;
  deviceType?: DeviceType;
  status?: boolean;
  search?: string;
}

export interface AlarmFilters extends PaginationParams {
  homeId?: number;
  deviceId?: number;
  severity?: AlarmSeverity;
  status?: AlarmStatus;
  startDate?: string;
  endDate?: string;
}

export interface EnergyFilters {
  deviceId?: number;
  homeId?: number;
  startDate?: string;
  endDate?: string;
  groupBy?: "hour" | "day" | "week" | "month";
}

// WebSocket Events
export interface WebSocketEvent<T = any> {
  event: string;
  data: T;
  timestamp: string;
}

export interface DeviceStatusEvent {
  deviceId: number;
  status: boolean;
  lastSeenAt: string;
}

export interface TelemetryEvent {
  deviceId: number;
  data: SensorData;
}

export interface AlarmEvent {
  alarm: AlarmEvent;
  homeId: number;
}

// Notification
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  alarmSeverities: AlarmSeverity[];
  deviceOffline: boolean;
  energyThreshold: boolean;
}

// Settings
export interface UserSettings {
  theme: "light" | "dark" | "system";
  language: "id" | "en";
  notifications: NotificationPreferences;
  energyCostPerKwh: number;
  currency: string;
  timezone: string;
}
