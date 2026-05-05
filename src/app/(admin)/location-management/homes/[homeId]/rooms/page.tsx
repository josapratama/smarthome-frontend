import { RoomsView } from "./components/rooms-view";

export default async function RoomsPage({
  params,
}: {
  params: Promise<{ homeId: string }>;
}) {
  const { homeId } = await params;
  return <RoomsView homeId={parseInt(homeId, 10)} />;
}
