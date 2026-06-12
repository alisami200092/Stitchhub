"use client";

import { useCallback, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useProfileStore } from "@/stores/profile-store";

export function useProfile() {
  const {
    activeTab, user, logs, invoices, selectedLog, loading,
    profileName, routingEmail, isUpdatingProfile, mfaEnabled,
    setActiveTab, setUser, setLogs, setInvoices, setSelectedLog,
    setLoading, setProfileName, setRoutingEmail, setIsUpdatingProfile,
    toggleMfa,
  } = useProfileStore();

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

    setInvoices([
      { id: "1", invoiceNumber: "INV-2026-4821", totalAmount: "$1,799.10", status: "paid", createdAt: "2026-06-01" },
      { id: "2", invoiceNumber: "INV-2026-9104", totalAmount: "$8,500.00", status: "unpaid", createdAt: "2026-06-05" },
    ]);

    setLoading(false);
  }, [setUser, setProfileName, setRoutingEmail, setLogs, setSelectedLog, setInvoices, setLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { name: profileName },
    });
    if (error) alert(`Update Error: ${error.message}`);
    else alert("Profile updated successfully!");
    setIsUpdatingProfile(false);
  };

  const hasEscalations = logs.some((log) => log.status === "escalated");

  return {
    activeTab, user, logs, invoices, selectedLog, loading,
    profileName, routingEmail, isUpdatingProfile, mfaEnabled,
    hasEscalations,
    setActiveTab, setSelectedLog, setProfileName,
    handleUpdateProfile, toggleMfa,
  };
}
