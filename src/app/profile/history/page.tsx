"use client";

import React from "react";
import { useProfileStore } from "@/stores/profile-store";
import OrderHistoryTab from "@/components/profile/OrderHistoryTab";

export default function ProfileHistoryPage() {
  const invoices = useProfileStore((s) => s.invoices);

  return (
    <OrderHistoryTab invoices={invoices} />
  );
}
