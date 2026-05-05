"use client";

import { useAppInfo } from "./hooks";
import { AppInfoList, EmptyState, LoadingState } from "./components";

export default function UserAppInfoPage() {
  const { appInfo, isLoading, hasData } = useAppInfo();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {hasData ? <AppInfoList appInfo={appInfo} /> : <EmptyState />}
    </div>
  );
}
