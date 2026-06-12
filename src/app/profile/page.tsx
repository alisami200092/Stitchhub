"use client";

import React from "react";
import { useProfile } from "@/hooks/useProfile";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import InboxPanel from "@/components/profile/InboxPanel";
import ProfileAccountTab from "@/components/profile/ProfileAccountTab";
import ProfileSecurityTab from "@/components/profile/ProfileSecurityTab";
import OrderHistoryTab from "@/components/profile/OrderHistoryTab";

export default function PartnerDashboardPage() {
  const {
    activeTab, user, logs, invoices, selectedLog, loading,
    profileName, routingEmail, isUpdatingProfile, mfaEnabled,
    hasEscalations,
    setActiveTab, setSelectedLog, setProfileName,
    handleUpdateProfile, toggleMfa,
  } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#090a0f] flex items-center justify-center text-zinc-400 font-mono text-xs">
        <span className="h-4 w-4 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin mr-3" />
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#090a0f] text-zinc-100 pt-28 pb-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="border-b border-zinc-800/80 pb-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-white">Partner Workspace</h1>
            <p className="text-xs text-zinc-500 mt-1">Manage your account, view order history, and track messages.</p>
          </div>
          <div className="flex items-center gap-3 bg-[#121316] border border-zinc-800/80 rounded-xl px-4 py-2.5 shrink-0 self-start md:self-auto">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <div className="font-mono text-[11px]">
              <span className="text-zinc-500">Account ID:</span> <span className="text-zinc-300 font-bold">{user?.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3">
            <ProfileSidebar activeTab={activeTab} hasEscalations={hasEscalations} onTabChange={setActiveTab} />
          </div>
          <div className="lg:col-span-9 bg-[#121316] border border-zinc-800 rounded-2xl p-6 min-h-[60vh] shadow-2xl relative overflow-hidden">
            {activeTab === "inbox" && (
              <InboxPanel logs={logs} selectedLog={selectedLog} onSelectLog={setSelectedLog} />
            )}
            {activeTab === "account" && (
              <ProfileAccountTab
                profileName={profileName}
                routingEmail={routingEmail}
                isUpdating={isUpdatingProfile}
                onNameChange={setProfileName}
                onSave={handleUpdateProfile}
              />
            )}
            {activeTab === "security" && (
              <ProfileSecurityTab mfaEnabled={mfaEnabled} onToggle={toggleMfa} />
            )}
            {activeTab === "ledger" && (
              <OrderHistoryTab invoices={invoices} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
