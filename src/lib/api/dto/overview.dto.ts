/**
 * Overview/Dashboard DTOs
 */

export interface HomeOverviewDTO {
  id: number;
  name: string;
  city: string | null;
  roleInHome: string;
  devicesOnline: number;
  devicesOffline: number;
  openAlarms: number;
}

export interface OverviewDTO {
  users: number;
  homes: number;
  devices: number;
  onlineDevices: number;
  offlineDevices: number;
  pendingInvitesCount: number;
  homesList: HomeOverviewDTO[];
}

export interface DashboardResponse {
  data: {
    myHomesCount: number;
    pendingInvitesCount: number;
    homes: HomeOverviewDTO[];
  };
}
