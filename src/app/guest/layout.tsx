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

  // Guest layout is accessible by all authenticated users
  // The actual permission check should be done at the API level

  return <GuestLayoutClient>{children}</GuestLayoutClient>;
}
