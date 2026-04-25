"use client";

import { usePrivacySettings, useDataManagement } from "./hooks";
import {
  ProfileVisibilitySection,
  CommunicationSection,
  DataPrivacySection,
  DataManagementSection,
  DangerZoneSection,
  LoadingState,
} from "./components";

export default function PrivacyPage() {
  const { settings, isLoading, handleToggle } = usePrivacySettings();
  const { isProcessing, handleDownloadData, handleDeleteData } =
    useDataManagement();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4 p-4 pb-20">
      {/* Profile Visibility */}
      <ProfileVisibilitySection settings={settings} onToggle={handleToggle} />

      {/* Communication Preferences */}
      <CommunicationSection settings={settings} onToggle={handleToggle} />

      {/* Data & Privacy */}
      <DataPrivacySection settings={settings} onToggle={handleToggle} />

      {/* Data Management */}
      <DataManagementSection
        onDownload={handleDownloadData}
        isProcessing={isProcessing}
      />

      {/* Danger Zone */}
      <DangerZoneSection
        onDelete={handleDeleteData}
        isProcessing={isProcessing}
      />
    </div>
  );
}
