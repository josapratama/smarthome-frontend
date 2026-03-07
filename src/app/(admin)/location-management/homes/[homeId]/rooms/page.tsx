import { RoomsClient } from "./ui";

export default async function RoomsPage({
  params,
}: {
  params: Promise<{ homeId: string }>;
}) {
  const { homeId } = await params;
  return <RoomsClient homeId={parseInt(homeId)} />;
}
