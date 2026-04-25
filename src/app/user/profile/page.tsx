"use client";

import { useProfile, useAvatar, useChangePassword } from "./hooks";
import { isGoogleUser } from "./utils/profile";
import {
  ProfileCard,
  AccountInfoSection,
  ChangePasswordSection,
  AccountActionsSection,
  LoadingState,
  ErrorState,
} from "./components";

export default function UserProfilePage() {
  const {
    profile,
    isLoading,
    isEditing,
    isSaving,
    editedUsername,
    editedEmail,
    setEditedUsername,
    setEditedEmail,
    setIsEditing,
    handleSave,
    handleCancel,
    refetch,
  } = useProfile();

  const {
    fileInputRef,
    isUploading,
    handleUpload,
    handleDelete,
    triggerUpload,
  } = useAvatar(refetch);

  const {
    showPasswordForm,
    setShowPasswordForm,
    isSaving: isChangingPassword,
    passwordForm,
    updateField,
    handleChangePassword,
    handleCancel: handleCancelPassword,
  } = useChangePassword();

  if (isLoading) return <LoadingState />;
  if (!profile) return <ErrorState />;

  const googleUser = isGoogleUser(profile);

  return (
    <div className="space-y-4 p-4 pb-20">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Profile Card */}
        <ProfileCard
          profile={profile}
          isGoogleUser={googleUser}
          isUploading={isUploading}
          fileInputRef={fileInputRef}
          onUpload={handleUpload}
          onDeleteAvatar={handleDelete}
          onTriggerUpload={triggerUpload}
        />

        {/* Account Information & Settings */}
        <div className="md:col-span-2 space-y-4">
          {/* Account Info */}
          <AccountInfoSection
            profile={profile}
            isGoogleUser={googleUser}
            isEditing={isEditing}
            isSaving={isSaving}
            editedUsername={editedUsername}
            editedEmail={editedEmail}
            onUsernameChange={setEditedUsername}
            onEmailChange={setEditedEmail}
            onEdit={() => setIsEditing(true)}
            onSave={handleSave}
            onCancel={handleCancel}
          />

          {/* Security / Change Password */}
          {!googleUser && (
            <ChangePasswordSection
              showPasswordForm={showPasswordForm}
              isSaving={isChangingPassword}
              passwordForm={passwordForm}
              onShowForm={() => setShowPasswordForm(true)}
              onFieldChange={updateField}
              onSubmit={handleChangePassword}
              onCancel={handleCancelPassword}
            />
          )}

          {/* Account Actions */}
          <AccountActionsSection />
        </div>
      </div>
    </div>
  );
}
