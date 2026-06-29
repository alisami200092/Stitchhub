"use client";

import React from "react";
import { useProfileStore } from "@/stores/profile-store";
import InboxPanel from "@/components/profile/InboxPanel";

export default function ProfileInboxPage() {
  const logs = useProfileStore((s) => s.logs);
  const selectedLog = useProfileStore((s) => s.selectedLog);
  const setSelectedLog = useProfileStore((s) => s.setSelectedLog);

  return (
    <InboxPanel
      logs={logs}
      selectedLog={selectedLog}
      onSelectLog={setSelectedLog}
    />
  );
}
