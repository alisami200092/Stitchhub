import React from "react";

interface ChatInputFormProps {
  message: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  statusMessage: string | null;
}

export default function ChatInputForm({
  message,
  onChange,
  onSubmit,
  statusMessage,
}: ChatInputFormProps) {
  return (
    <div className="p-4 border-t border-zinc-900/80 bg-zinc-950/30">
      {statusMessage && (
        <div className="text-[10px] text-emerald-400 font-bold mb-2 animate-pulse font-mono uppercase tracking-wider">
          ✓ {statusMessage}
        </div>
      )}
      <form onSubmit={onSubmit} className="relative">
        <input
          type="text"
          value={message}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type a message to StitchHub..."
          className="w-full bg-[#070708] border border-zinc-900 rounded-2xl py-4 pl-4 pr-16 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-sm"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#d4af37] text-black rounded-xl flex items-center justify-center hover:bg-[#ebd06f] disabled:opacity-50 disabled:hover:bg-[#d4af37] transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5 rotate-90 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
