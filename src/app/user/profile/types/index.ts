export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  googleName?: string;
  googlePicture?: string;
  avatarUrl?: string | null;
  authProvider?: string;
  createdAt: string;
}

export interface PasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
