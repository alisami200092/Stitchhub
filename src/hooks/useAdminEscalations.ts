"use client";

import { useState, useEffect } from "react";

interface EscalationAlert {
  id: string;
  subject: string;
  body: string;
  userId: string;
}

export function useAdminEscalations() {
  const [escalations, setEscalations] = useState<EscalationAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch("/api/admin/escalations");
        if (res.ok) {
          const data = await res.json();
          setEscalations(data.escalations || []);
        }
      } catch {
        console.error("Failed to load alerts");
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  return { escalations, loading };
}
