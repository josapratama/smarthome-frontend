/**
 * Authentication DTOs
 */

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}
