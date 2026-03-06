import { Suspense } from "react";
import EnergyClient from "./ui";

export const metadata = {
  title: "Energy Analytics | Smart Home",
  description: "Monitor energy consumption and AI predictions",
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin mx-auto mb-2 rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default function EnergyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EnergyClient />
    </Suspense>
  );
}
