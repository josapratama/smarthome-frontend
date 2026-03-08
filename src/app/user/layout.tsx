import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserLayoutClient } from "@/components/user/user-layout-client";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get("access_token")?.value;
  const userRole = jar.get("user_role")?.value;

  if (!token) redirect("/login");
  if (userRole === "ADMIN") redirect("/dashboard");

  return <UserLayoutClient>{children}</UserLayoutClient>;
}
