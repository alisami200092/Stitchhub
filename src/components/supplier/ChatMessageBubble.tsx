import React from "react";

interface ChatMessageBubbleProps {
  msg: {
    id: number;
    sender: string;
    message_text: string;
    createdAt?: string;
    created_at?: string;
  };
}

export default function ChatMessageBubble({ msg }: ChatMessageBubbleProps) {
  const isAdmin = msg.sender === "admin";
  const time = new Date(msg.createdAt || msg.created_at || "").toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex gap-4 ${isAdmin ? "" : "flex-row-reverse"}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-[10px] font-bold ${
          isAdmin
            ? "bg-zinc-800 border-zinc-700 text-zinc-400"
            : "bg-[#d4af37]/10 border-zinc-900 text-[#d4af37]"
        }`}
      >
        <span>{isAdmin ? "SH" : "YOU"}</span>
      </div>
      <div
        className={`p-4 rounded-2xl max-w-[80%] text-sm ${
          isAdmin
            ? "bg-zinc-950/40 border border-zinc-900 text-zinc-100 rounded-tl-sm"
            : "bg-[#d4af37]/5 border border-[#d4af37]/20 text-zinc-100 rounded-tr-sm"
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{msg.message_text}</p>
        <span
          className={`text-[9px] font-mono mt-2 block ${
            isAdmin ? "text-zinc-500" : "text-[#d4af37]/50 text-right"
          }`}
        >
          {time}
        </span>
      </div>
    </div>
  );
}
