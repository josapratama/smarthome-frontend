export interface NotificationTemplate {
  id: number;
  type: string;
  channel: string;
  emailSubject?: string;
  emailBody?: string;
  pushTitle?: string;
  pushBody?: string;
  pushIcon?: string;
  pushSound?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SendNotificationForm {
  channel: string;
  type: string;
  homeId: string;
  title: string;
  body: string;
  subject: string;
}
