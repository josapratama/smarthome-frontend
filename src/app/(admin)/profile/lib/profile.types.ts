export interface AdminProfile {
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
