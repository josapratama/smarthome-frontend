import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GuestLayoutClient } from "@/components/guest/GuestLayoutClient";

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get("access_token")?.value;
  const userRole = jar.get("user_role")?.value;

  if (!token) redirect("/login");

  // Redirect based on role
  if (userRole === "ADMIN") redirect("/dashboard");
  if (userRole === "USER") redirect("/user/dashboard");
  // GUEST stays here

  return <GuestLayoutClient>{children}</GuestLayoutClient>;
}
