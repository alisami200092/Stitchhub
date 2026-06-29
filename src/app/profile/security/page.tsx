"use client";

import React from "react";
import { useProfile } from "@/hooks/useProfile";
import ProfileSecurityTab from "@/components/profile/ProfileSecurityTab";

export default function ProfileSecurityPage() {
  const {
    mfaEnabled,
    isUpdatingPassword,
    handleUpdatePassword,
    mfaEnrollmentData,
    isMfaSetupOpen,
    isMfaDisableOpen,
    mfaError,
    startMfaEnrollment,
    cancelMfaEnrollment,
    verifyAndConfirmMfaEnrollment,
    startMfaDisable,
    cancelMfaDisable,
    disableMfa,
  } = useProfile();

  return (
    <ProfileSecurityTab
      mfaEnabled={mfaEnabled}
      isUpdatingPassword={isUpdatingPassword}
      onUpdatePassword={handleUpdatePassword}
      mfaEnrollmentData={mfaEnrollmentData}
      isMfaSetupOpen={isMfaSetupOpen}
      isMfaDisableOpen={isMfaDisableOpen}
      mfaError={mfaError}
      onStartEnrollment={startMfaEnrollment}
      onCancelEnrollment={cancelMfaEnrollment}
      onVerifyEnrollment={verifyAndConfirmMfaEnrollment}
      onStartDisable={startMfaDisable}
      onCancelDisable={cancelMfaDisable}
      onDisableMfa={disableMfa}
    />
  );
}
