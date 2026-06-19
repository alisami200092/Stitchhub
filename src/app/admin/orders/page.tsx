"use client";

import React from "react";
import Image from "next/image";
import GlassCard from "@/components/admin/GlassCard";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import LoadingSpinner from "@/components/admin/LoadingSpinner";
import EmptyState from "@/components/admin/EmptyState";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { createClient } from "@/utils/supabase/client";

export default function AdminOrdersPage() {
  const {
    orders, loading, selectedOrder, updatingId,
    quoteValue, isEditingQuote,
    messages, threadId, agentOverride, chatLoading, adminMessage,
    setQuoteValue, setIsEditingQuote, setAdminMessage,
    handleSelectOrder, handleUpdateStatus, handleUpdateQuote,
    toggleTakeover, sendAdminMessage,
  } = useAdminOrders();

  const [isLogExpanded, setIsLogExpanded] = React.useState(true);

  // Supplier chat integration
  const [supplierMessages, setSupplierMessages] = React.useState<any[]>([]);
  const [supplierChatText, setSupplierChatText] = React.useState("");
  const [supplierChatLoading, setSupplierChatLoading] = React.useState(false);
  const [activeDetailTab, setActiveDetailTab] = React.useState<"details" | "supplier">("details");
  const [supplierStatusMessage, setSupplierStatusMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedOrder) {
      setSupplierMessages([]);
      return;
    }

    const supabase = createClient();
    const activeInvoice = selectedOrder.invoiceNumber;

    const fetchSupplierMessages = async () => {
      setSupplierChatLoading(true);
      const { data, error } = await supabase
        .from("supplier_messages")
        .select("*")
        .eq("order_id", activeInvoice)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setSupplierMessages(data);
      }
      setSupplierChatLoading(false);
    };

    fetchSupplierMessages();

    // Subscribe to new supplier_messages
    const channel = supabase
      .channel(`admin_supplier_messages:${activeInvoice}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "supplier_messages",
          filter: `order_id=eq.${activeInvoice}`,
        },
        (payload) => {
          setSupplierMessages((prev) => {
            if (prev.some(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedOrder]);

  const sendSupplierMessage = async () => {
    if (!selectedOrder || !supplierChatText.trim()) return;
    const textToSend = supplierChatText.trim();
    setSupplierChatText("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("supplier_messages")
        .insert({
          order_id: selectedOrder.invoiceNumber,
          sender: "admin",
          message_text: textToSend,
        })
        .select();

      if (!error && data && data.length > 0) {
        setSupplierMessages((prev) => {
          if (prev.some((m) => m.id === data[0].id)) return prev;
          return [...prev, data[0]];
        });
        setSupplierStatusMessage("Message sent to Supplier!");
        setTimeout(() => setSupplierStatusMessage(null), 3000);
      }

      if (error) {
        console.error("Error sending supplier message:", error);
      }
    } catch (err) {
      console.error("Unexpected supplier messaging error:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 w-full">
      <AdminPageHeader title="Orders" subtitle="Review and manage customer orders and quotes." />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <GlassCard className="p-6 h-[720px] flex flex-col" glow>
            <h3 className="text-sm font-bold text-zinc-300 mb-6 relative z-10">Orders</h3>
            
            {loading ? (
              <LoadingSpinner />
            ) : orders.length === 0 ? (
              <EmptyState message="No orders found." />
            ) : (
              <div className="flex-1 overflow-y-auto pr-2 relative z-10">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {["Invoice #", "Client", "Total Quote", "Status", "Date"].map((h) => (
                        <th key={h} className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-4 py-3 text-left border-b border-white/5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => handleSelectOrder(order)}
                        className={`cursor-pointer transition-colors ${selectedOrder?.id === order.id ? "bg-white/[0.05]" : "hover:bg-white/5"}`}
                      >
                        <td className="px-4 py-4 text-xs font-sans border-b border-white/5 text-zinc-300 font-mono font-bold text-[#d4af37]">
                          {order.invoiceNumber}
                        </td>
                        <td className="px-4 py-4 text-xs font-sans border-b border-white/5 text-zinc-300">
                          <p className="font-bold text-white truncate max-w-37.5">{order.user?.name || "Unregistered User"}</p>
                          <p className="text-[10px] text-zinc-500 truncate max-w-37.5">{order.user?.email || "No Email"}</p>
                        </td>
                        <td className="px-4 py-4 text-xs font-sans border-b border-white/5 text-zinc-300 font-mono font-medium truncate max-w-30">
                          {order.totalAmount}
                        </td>
                        <td className="px-4 py-4 text-xs font-sans border-b border-white/5 text-zinc-300">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-4 text-xs font-sans border-b border-white/5 text-zinc-300 font-mono text-zinc-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6 flex flex-col h-[720px]">
            {selectedOrder ? (
              <div className="flex-1 flex flex-col overflow-hidden h-full">
                <div className="border-b border-white/10 pb-4 mb-6 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#d4af37] tracking-wider uppercase">Order Specifications</span>
                    <h3 className="text-lg font-bold text-white mt-1 font-display tracking-tight">{selectedOrder.invoiceNumber}</h3>
                  </div>
                  <button
                    onClick={toggleTakeover}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all border ${
                      agentOverride
                        ? "bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.2)] hover:bg-red-500/20 animate-pulse"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>🚨</span>
                    <span>{agentOverride ? "Takeover ON" : "Takeover Chat"}</span>
                  </button>
                </div>

                {/* Tabs Header */}
                <div className="flex border-b border-white/10 mb-6 shrink-0">
                  <button
                    onClick={() => setActiveDetailTab("details")}
                    className={`flex-1 pb-3 text-[10px] font-bold font-mono uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                      activeDetailTab === "details"
                        ? "border-[#d4af37] text-white"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Details & Client Chat
                  </button>
                  <button
                    onClick={() => setActiveDetailTab("supplier")}
                    className={`flex-1 pb-3 text-[10px] font-bold font-mono uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                      activeDetailTab === "supplier"
                        ? "border-[#d4af37] text-white"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Supplier Negotiation Channel
                  </button>
                </div>

                {activeDetailTab === "details" ? (
                  <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6">
                    <div>
                      <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">Client Details</h4>
                      <div className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-1">
                        <p className="text-xs font-bold text-white">{selectedOrder.user?.name || "Unregistered User"}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{selectedOrder.user?.email}</p>
                        <p className="text-[9px] text-zinc-600 font-mono mt-1">Submitted: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">Quote</h4>
                      <div className="bg-black/20 border border-white/5 p-4 rounded-xl">
                        {isEditingQuote ? (
                          <form onSubmit={handleUpdateQuote} className="space-y-2">
                            <input
                              type="text" value={quoteValue}
                              onChange={(e) => setQuoteValue(e.target.value)}
                              className="w-full bg-black/60 border border-[#d4af37]/30 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                              placeholder="e.g. $1,420.00"
                            />
                            <div className="flex gap-2 justify-end">
                              <button type="button" onClick={() => setIsEditingQuote(false)}
                                className="px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold hover:bg-white/10">Cancel</button>
                              <button type="submit"
                                className="px-2.5 py-1.5 bg-[#d4af37] text-[#090a0f] rounded-md text-[10px] font-bold hover:bg-[#bfa032]">Save</button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-mono font-bold text-white">{selectedOrder.totalAmount}</span>
                            <button onClick={() => setIsEditingQuote(true)}
                              className="text-[10px] text-[#d4af37] hover:underline font-mono">Update Quote</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">Order Status</h4>
                      <div className="relative">
                        <select
                          disabled={updatingId === selectedOrder.id}
                          value={selectedOrder.status}
                          onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-zinc-200 focus:border-[#d4af37] focus:outline-none transition-colors font-mono uppercase tracking-wider cursor-pointer appearance-none"
                        >
                          {["draft sourcing", "review required", "approved", "processing", "shipping", "delivered"].map((status) => (
                            <option key={status} value={status} className="bg-[#090a0f] text-zinc-200">
                              {status}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                          <span className="text-[10px]">▼</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">Items ({selectedOrder.itemsSnapshot.length})</h4>
                      <div className="space-y-3">
                        {selectedOrder.itemsSnapshot.map((item, idx) => (
                          <div key={idx} className="bg-black/20 border border-white/5 p-4 rounded-xl space-y-3">
                            <div className="flex gap-3">
                              <div className="h-10 w-10 bg-zinc-900 border border-white/10 rounded-md overflow-hidden shrink-0">
                                <Image src={item.product.img} alt={item.product.title} width={40} height={40} className="h-full w-full object-cover" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">{item.product.cat}</span>
                                <h5 className="text-xs font-bold text-white truncate">{item.product.title}</h5>
                                <div className="flex justify-between mt-1 text-[10px] font-mono text-zinc-400">
                                  <span>Qty: {item.quantity}</span>
                                  <span>Size: {item.size || "Standard"}</span>
                                </div>
                              </div>
                            </div>
                            {item.customNotes && (
                              <div className="bg-black/30 border border-white/5 p-2.5 rounded-lg">
                                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Custom Notes</span>
                                <p className="text-[10px] text-zinc-300 italic mt-0.5 leading-relaxed">&quot;{item.customNotes}&quot;</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Operations Correspondence Log */}
                    <div className="border-t border-white/10 pt-6">
                      <div 
                        className="flex items-center justify-between mb-4 cursor-pointer hover:opacity-85 select-none"
                        onClick={() => setIsLogExpanded(!isLogExpanded)}
                      >
                        <h4 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <span className="text-[8px] transition-transform duration-200 inline-block" style={{ transform: isLogExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                          <span>AI Operations Correspondence Log</span>
                        </h4>
                        <span className="text-[8px] bg-white/5 border border-white/10 text-zinc-400 px-2 py-0.5 rounded font-mono">
                          {isLogExpanded ? "Collapse" : "Expand"}
                        </span>
                      </div>

                      {isLogExpanded && (
                        <div className="space-y-4">
                          {chatLoading ? (
                            <div className="flex justify-center py-8">
                              <span className="h-4 w-4 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
                            </div>
                          ) : messages.length === 0 ? (
                            <div className="text-[10px] text-zinc-500 italic py-4 text-center bg-black/20 rounded-xl border border-white/5 font-mono">
                              No correspondence logs found.
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 flex flex-col scrollbar-thin">
                              {messages.map((msg: any, idx: number) => {
                                const isUser = msg.role === "user";
                                return (
                                  <div
                                    key={idx}
                                    className={`flex flex-col max-w-[85%] rounded-xl p-3 text-[11px] ${
                                      isUser
                                        ? "bg-[#16171d] text-zinc-100 self-start mr-auto border border-zinc-800"
                                        : "bg-[#d4af37]/10 text-[#fef08a] self-end ml-auto border border-[#d4af37]/20"
                                    }`}
                                  >
                                    <span className="text-[8px] font-mono font-bold text-zinc-500 mb-1">
                                      {isUser ? "👤 CLIENT" : "🤖 STITCHHUB AGENT / ADMIN"}
                                    </span>
                                    <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.content}</p>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Admin Message Input (Takeover Mode) */}
                          {agentOverride && (
                            <div className="mt-4 bg-red-950/5 border border-red-500/10 p-3.5 rounded-xl space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                                  Human Takeover Active
                                </span>
                                <span className="text-[8px] text-zinc-500 font-mono">Ollama pipeline bypassed</span>
                              </div>
                              <textarea
                                rows={2}
                                value={adminMessage}
                                onChange={(e) => setAdminMessage(e.target.value)}
                                placeholder="Compose manual reply to client..."
                                className="w-full bg-black/40 border border-white/5 rounded-lg p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/30 font-sans"
                              />
                              <div className="flex justify-end">
                                <button
                                  onClick={sendAdminMessage}
                                  disabled={!adminMessage.trim()}
                                  className="bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:hover:bg-red-600 text-white font-mono font-bold text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded-md transition-all"
                                >
                                  Send Reply
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col min-h-0 bg-zinc-950/20 border border-zinc-800 rounded-xl p-4 overflow-hidden">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 font-mono">
                      Supplier Negotiation Channel
                    </h4>

                    {supplierChatLoading ? (
                      <div className="flex justify-center items-center flex-1 py-8">
                        <span className="h-6 w-6 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
                      </div>
                    ) : supplierMessages.length === 0 ? (
                      <div className="text-[10px] text-zinc-500 italic py-8 text-center bg-black/20 rounded-xl border border-white/5 font-mono flex-1 flex items-center justify-center">
                        No supplier correspondence recorded.
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto pr-1 flex flex-col space-y-3 mb-4 scrollbar-thin">
                        {supplierMessages.map((msg: any) => {
                          const isAdmin = msg.sender === "admin";
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col max-w-[85%] rounded-xl p-3 text-[11px] ${
                                isAdmin
                                  ? "bg-zinc-800 text-zinc-100 self-end ml-auto border border-zinc-700/50"
                                  : "bg-[#d4af37]/10 text-[#fef08a] self-start mr-auto border border-[#d4af37]/20"
                              }`}
                            >
                              <span className="text-[8px] font-mono font-bold text-zinc-500 mb-1">
                                {isAdmin ? "👤 ADMIN" : "🏭 SUPPLIER"}
                              </span>
                              <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.message_text}</p>
                              <span className={`text-[7px] font-mono mt-1 text-right ${isAdmin ? "text-zinc-500" : "text-[#d4af37]/60"}`}>
                                {new Date(msg.createdAt || msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Send Message to Supplier */}
                    <div className="mt-auto pt-4 border-t border-white/5">
                      {supplierStatusMessage && (
                        <div className="text-[10px] text-emerald-400 font-bold mb-2 animate-pulse font-mono uppercase tracking-wider">
                          ✓ {supplierStatusMessage}
                        </div>
                      )}
                      <textarea
                        rows={3}
                        value={supplierChatText}
                        onChange={(e) => setSupplierChatText(e.target.value)}
                        placeholder="Compose message to Supplier..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#d4af37]/30 font-sans resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={sendSupplierMessage}
                          disabled={!supplierChatText.trim()}
                          className="bg-[#d4af37] hover:bg-[#bfa032] disabled:opacity-30 text-zinc-950 font-mono font-bold text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded-md transition-all cursor-pointer"
                        >
                          Send to Supplier
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-grow flex flex-col justify-center items-center text-zinc-500 text-xs">
                Select an order from the list to view specifications.
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
