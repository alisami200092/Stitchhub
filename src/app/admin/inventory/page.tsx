"use client";

import React, { useEffect, useState } from "react";
import GlassCard from "@/components/admin/GlassCard";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import LoadingSpinner from "@/components/admin/LoadingSpinner";

interface InventoryItem {
  id: number;
  productName: string;
  stockQuantity: number;
  reorderLevel: number;
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [adjustments, setAdjustments] = useState<Record<number, { stock: string; reorder: string }>>({});
  const [generalMessage, setGeneralMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/admin/inventory");
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory || []);
        // Initialize inputs
        const initialAdjustments: Record<number, { stock: string; reorder: string }> = {};
        data.inventory?.forEach((item: InventoryItem) => {
          initialAdjustments[item.id] = {
            stock: String(item.stockQuantity),
            reorder: String(item.reorderLevel),
          };
        });
        setAdjustments(initialAdjustments);
      } else {
        setGeneralMessage({ type: "error", text: "Failed to load materials inventory." });
      }
    } catch (error) {
      console.error("Failed to load inventory:", error);
      setGeneralMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdate = async (id: number) => {
    const adj = adjustments[id];
    if (!adj) return;

    const stockVal = parseInt(adj.stock, 10);
    const reorderVal = parseInt(adj.reorder, 10);

    if (isNaN(stockVal) || isNaN(reorderVal) || stockVal < 0 || reorderVal < 0) {
      alert("Please enter valid non-negative integer numbers for stock and reorder level.");
      return;
    }

    setSubmittingId(id);
    setGeneralMessage(null);

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          stockQuantity: stockVal,
          reorderLevel: reorderVal,
        }),
      });

      if (res.ok) {
        setGeneralMessage({ type: "success", text: "Inventory successfully updated." });
        // Refresh local state values
        setInventory(prev =>
          prev.map(item =>
            item.id === id
              ? { ...item, stockQuantity: stockVal, reorderLevel: reorderVal }
              : item
          )
        );
      } else {
        const data = await res.json();
        setGeneralMessage({ type: "error", text: data.error || "Failed to update inventory." });
      }
    } catch (err) {
      console.error(err);
      setGeneralMessage({ type: "error", text: "An error occurred during update." });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleInputChange = (id: number, field: "stock" | "reorder", value: string) => {
    setAdjustments(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Helper metrics
  const totalStock = inventory.reduce((sum, item) => sum + item.stockQuantity, 0);
  const lowStockCount = inventory.filter(item => item.stockQuantity <= item.reorderLevel).length;

  return (
    <div className="space-y-6 animate-fadeIn w-full">
      <AdminPageHeader
        title="Materials Stock Control"
        subtitle="Manage blank raw materials, track stock levels, and set custom reorder warning thresholds."
      />

      {generalMessage && (
        <div
          className={`p-4 rounded-xl text-xs border ${
            generalMessage.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {generalMessage.text}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-5 flex flex-col space-y-1">
              <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Total Categories</span>
              <p className="text-2xl font-bold text-white font-mono">{inventory.length}</p>
              <span className="text-[9px] text-zinc-400">Core manufacturing items tracked</span>
            </GlassCard>

            <GlassCard className="p-5 flex flex-col space-y-1">
              <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Aggregate Blanks Stock</span>
              <p className="text-2xl font-bold text-white font-mono">{totalStock}</p>
              <span className="text-[9px] text-zinc-400">Total units available across all categories</span>
            </GlassCard>

            <GlassCard className={`p-5 flex flex-col space-y-1 border ${lowStockCount > 0 ? "border-amber-500/30 bg-amber-500/5" : ""}`}>
              <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">Low Stock Warnings</span>
              <p className={`text-2xl font-bold font-mono ${lowStockCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                {lowStockCount}
              </p>
              <span className="text-[9px] text-zinc-400">Items at or below reorder threshold levels</span>
            </GlassCard>
          </div>

          {/* Main inventory table */}
          <GlassCard className="p-6">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                    <th className="pb-3 font-semibold">Raw Material Title</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                    <th className="pb-3 font-semibold text-center">Stock Count</th>
                    <th className="pb-3 font-semibold text-center">Reorder Trigger</th>
                    <th className="pb-3 font-semibold text-right">Quick Inventory Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {inventory.map(item => {
                    const isLow = item.stockQuantity <= item.reorderLevel;
                    const isDepleted = item.stockQuantity === 0;
                    
                    let statusLabel = "In Stock";
                    let statusColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                    if (isDepleted) {
                      statusLabel = "Depleted";
                      statusColor = "bg-red-500/10 text-red-400 border border-red-500/20";
                    } else if (isLow) {
                      statusLabel = "Low Stock";
                      statusColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                    }

                    return (
                      <tr key={item.id} className="text-xs text-zinc-200">
                        <td className="py-4 pr-4 font-semibold text-white">
                          {item.productName}
                        </td>
                        <td className="py-4 text-center">
                          <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-4 text-center font-mono font-bold text-sm">
                          {item.stockQuantity}
                        </td>
                        <td className="py-4 text-center font-mono text-zinc-400">
                          {item.reorderLevel}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-end gap-3">
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] font-mono text-zinc-500 uppercase">Stock:</span>
                              <input
                                type="number"
                                min="0"
                                value={adjustments[item.id]?.stock ?? ""}
                                onChange={(e) => handleInputChange(item.id, "stock", e.target.value)}
                                className="w-16 bg-black/40 border border-white/10 rounded px-2 py-1 text-center font-mono font-bold text-white focus:outline-none focus:border-[#d4af37]/50"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] font-mono text-zinc-500 uppercase">Alert At:</span>
                              <input
                                type="number"
                                min="0"
                                value={adjustments[item.id]?.reorder ?? ""}
                                onChange={(e) => handleInputChange(item.id, "reorder", e.target.value)}
                                className="w-16 bg-black/40 border border-white/10 rounded px-2 py-1 text-center font-mono text-zinc-400 focus:outline-none focus:border-[#d4af37]/50"
                              />
                            </div>
                            <button
                              disabled={submittingId === item.id}
                              onClick={() => handleUpdate(item.id)}
                              className="px-3 py-1 rounded bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border border-[#d4af37]/35 hover:border-[#d4af37]/65 text-[#d4af37] text-[10px] font-bold font-mono uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                              {submittingId === item.id ? "Syncing..." : "Update"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
