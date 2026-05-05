import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get("access_token")?.value;
  const userRole = jar.get("user_role")?.value;

  if (!token) redirect("/login");
  if (userRole !== "ADMIN") redirect("/user/dashboard");

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
