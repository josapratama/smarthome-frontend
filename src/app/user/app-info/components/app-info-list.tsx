"use client";

import { AppInfoCard } from "./app-info-card";
import type { AppInfoData } from "../hooks";

interface AppInfoListProps {
  appInfo: AppInfoData;
}

export function AppInfoList({ appInfo }: AppInfoListProps) {
  return (
    <div className="space-y-6">
      {Object.entries(appInfo).map(([category, items]) => (
        <AppInfoCard key={category} category={category} items={items || []} />
      ))}
    </div>
  );
}
