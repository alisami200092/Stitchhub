"use client";

import React from "react";
import { useProfile } from "@/hooks/useProfile";
import ProfileAccountTab from "@/components/profile/ProfileAccountTab";

export default function ProfileSettingsPage() {
  const {
    profileName,
    routingEmail,
    isUpdatingProfile,
    emailStep,
    emailSuccessMessage,
    setProfileName,
    setRoutingEmail,
    setEmailStep,
    setEmailSuccessMessage,
    handleUpdateProfile,
    verifyPasswordAndTriggerEmailChange,
  } = useProfile();

  return (
    <ProfileAccountTab
      profileName={profileName}
      routingEmail={routingEmail}
      isUpdating={isUpdatingProfile}
      emailStep={emailStep}
      emailSuccessMessage={emailSuccessMessage}
      onClearSuccessMessage={() => setEmailSuccessMessage("")}
      onEmailStepChange={setEmailStep}
      onNameChange={setProfileName}
      onEmailChange={setRoutingEmail}
      onSave={handleUpdateProfile}
      onVerifyPassword={verifyPasswordAndTriggerEmailChange}
    />
  );
}
