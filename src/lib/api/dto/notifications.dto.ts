/**
 * Notification DTOs
 */

export interface NotificationEndpointDTO {
  id: number;
  userId: number;
  type: string;
  endpoint: string;
  isActive: boolean;
  createdAt: string;
}

export interface NotificationLogDTO {
  id: number;
  userId: number;
  type: string;
  message: string;
  sentAt: string;
  status: string;
}
