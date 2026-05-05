/**
 * Invite DTOs
 */

export interface HomeInviteTokenDTO {
  id: number;
  homeId: number;
  token: string;
  roleInHome: string;
  expiresAt: string;
  createdAt: string;
}

export interface InviteCreateRequest {
  homeId: number;
  roleInHome: string;
  expiresInDays?: number;
}
