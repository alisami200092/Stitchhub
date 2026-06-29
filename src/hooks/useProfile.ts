"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useProfileStore } from "@/stores/profile-store";

export function useProfile() {
  const {
    activeTab, user, logs, invoices, selectedLog, loading,
    profileName, routingEmail, isUpdatingProfile, mfaEnabled,
    setActiveTab, setUser, setLogs, setInvoices, setSelectedLog,
    setLoading, setProfileName, setRoutingEmail, setIsUpdatingProfile,
    setMfaEnabled,
  } = useProfileStore();

  const [emailStep, setEmailStep] = useState<"form" | "password">("form");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState("");

  const [mfaEnrollmentData, setMfaEnrollmentData] = useState<{ qrCode: string; secret: string; factorId: string } | null>(null);
  const [isMfaSetupOpen, setIsMfaSetupOpen] = useState(false);
  const [isMfaDisableOpen, setIsMfaDisableOpen] = useState(false);
  const [mfaError, setMfaError] = useState("");

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    setUser(user);
    setProfileName(user.user_metadata?.name || user.email?.split("@")[0] || "User");
    setRoutingEmail(user.email || "");

    try {
      const { data: factors, error: mfaListError } = await supabase.auth.mfa.listFactors();
      if (!mfaListError && factors) {
        const hasVerifiedMfa = factors.all.some(
          (f) => f.factor_type === "totp" && f.status === "verified"
        );
        setMfaEnabled(hasVerifiedMfa);
      }
    } catch (e) {
      console.error("MFA factor list error:", e);
    }

    try {
      const messageRes = await fetch("/api/agent/history");
      if (messageRes.ok) {
        const messageData = await messageRes.json();
        setLogs(messageData.logs || []);
        if (messageData.logs && messageData.logs.length > 0) {
          setSelectedLog(messageData.logs[0]);
        }
      }
    } catch (e) {
      console.error("Message log syncing error:", e);
    }

    try {
      const invoiceRes = await fetch("/api/profile/invoices");
      if (invoiceRes.ok) {
        const invoiceData = await invoiceRes.json();
        setInvoices(invoiceData.invoices || []);
      }
    } catch (e) {
      console.error("Invoice log syncing error:", e);
    }

    setLoading(false);
  }, [setUser, setProfileName, setRoutingEmail, setLogs, setSelectedLog, setInvoices, setLoading, setMfaEnabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Step 1: Save Profile Name (or push to Step 2 if Email has changed)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSuccessMessage("");
    const emailChanged = routingEmail && routingEmail.toLowerCase() !== user?.email?.toLowerCase();

    if (emailChanged) {
      setEmailStep("password");
      return;
    }

    // Only Name has changed
    setIsUpdatingProfile(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { name: profileName },
    });
    setIsUpdatingProfile(false);

    if (error) {
      alert(`Update Error: ${error.message}`);
    } else {
      alert("Name updated successfully!");
    }
  };

  // Step 2: Verify Password and trigger email change link
  const verifyPasswordAndTriggerEmailChange = async (password: string) => {
    setIsUpdatingProfile(true);
    setEmailSuccessMessage("");
    const supabase = createClient();

    // 1. Re-authenticate user by signing in again with password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password,
    });

    if (signInError) {
      setIsUpdatingProfile(false);
      throw new Error(signInError.message || "Incorrect password. Verification failed.");
    }

    // 2. Trigger email update request (sends confirmation link to the new email address)
    const { error: updateError } = await supabase.auth.updateUser({
      email: routingEmail,
    });

    setIsUpdatingProfile(false);

    if (updateError) {
      throw new Error(updateError.message || "Failed to request email update.");
    }

    // 3. Revert back to form step and notify user
    setEmailStep("form");
    setEmailSuccessMessage(`A verification link has been dispatched to ${routingEmail}. Please check your inbox and confirm the change.`);
  };

  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    setIsUpdatingPassword(true);
    const supabase = createClient();

    // 1. Re-authenticate user by signing in again with currentPassword
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password: currentPassword,
    });

    if (signInError) {
      setIsUpdatingPassword(false);
      throw new Error(signInError.message || "Incorrect current password. Verification failed.");
    }

    // 2. Update user to newPassword
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setIsUpdatingPassword(false);
    if (updateError) {
      throw updateError;
    }
  };

  const startMfaEnrollment = async () => {
    setMfaError("");
    setIsUpdatingProfile(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "Stitch Hub",
        friendlyName: "Stitch Hub Authenticator",
      });

      if (error) throw error;

      setMfaEnrollmentData({
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        factorId: data.id,
      });
      setIsMfaSetupOpen(true);
    } catch (err: any) {
      setMfaError(err?.message || "Failed to start MFA enrollment.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const cancelMfaEnrollment = async () => {
    if (mfaEnrollmentData) {
      try {
        const supabase = createClient();
        await supabase.auth.mfa.unenroll({
          factorId: mfaEnrollmentData.factorId,
        });
      } catch (e) {
        console.error("Error cleaning up unverified factor:", e);
      }
    }
    setMfaEnrollmentData(null);
    setIsMfaSetupOpen(false);
    setMfaError("");
  };

  const verifyAndConfirmMfaEnrollment = async (code: string) => {
    if (!mfaEnrollmentData) return;
    setMfaError("");
    setIsUpdatingProfile(true);
    try {
      const supabase = createClient();
      
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaEnrollmentData.factorId,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaEnrollmentData.factorId,
        challengeId: challengeData.id,
        code,
      });
      if (verifyError) throw verifyError;

      setMfaEnabled(true);
      setMfaEnrollmentData(null);
      setIsMfaSetupOpen(false);
      alert("Two-Factor Authentication enabled successfully!");
    } catch (err: any) {
      setMfaError(err?.message || "Verification failed. Please check the code.");
      throw err;
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const startMfaDisable = () => {
    setMfaError("");
    setIsMfaDisableOpen(true);
  };

  const cancelMfaDisable = () => {
    setIsMfaDisableOpen(false);
    setMfaError("");
  };

  const disableMfa = async (code: string) => {
    setMfaError("");
    setIsUpdatingProfile(true);
    try {
      const supabase = createClient();
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;

      const verifiedFactor = factors?.all?.find(
        (f) => f.factor_type === "totp" && f.status === "verified"
      );

      if (!verifiedFactor) {
        throw new Error("No active TOTP factor found to disable.");
      }

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: verifiedFactor.id,
        challengeId: challengeData.id,
        code,
      });
      if (verifyError) throw verifyError;

      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: verifiedFactor.id,
      });
      if (unenrollError) throw unenrollError;

      setMfaEnabled(false);
      setIsMfaDisableOpen(false);
      alert("Two-Factor Authentication disabled successfully.");
    } catch (err: any) {
      setMfaError(err?.message || "Failed to disable MFA. Please check code.");
      throw err;
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const hasEscalations = logs.some((log) => log.status === "escalated");

  return {
    activeTab, user, logs, invoices, selectedLog, loading,
    profileName, routingEmail, isUpdatingProfile, mfaEnabled,
    hasEscalations, isUpdatingPassword,
    emailStep, setEmailStep,
    emailSuccessMessage, setEmailSuccessMessage,
    mfaEnrollmentData, isMfaSetupOpen, isMfaDisableOpen, mfaError,
    setActiveTab, setSelectedLog, setProfileName, setRoutingEmail,
    handleUpdateProfile, handleUpdatePassword,
    verifyPasswordAndTriggerEmailChange,
    startMfaEnrollment, cancelMfaEnrollment, verifyAndConfirmMfaEnrollment,
    startMfaDisable, cancelMfaDisable, disableMfa,
  };
}
