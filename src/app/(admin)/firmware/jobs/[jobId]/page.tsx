import { OtaJobDetailClient } from "./ui";

export default async function OtaJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <OtaJobDetailClient jobId={parseInt(jobId)} />;
}
