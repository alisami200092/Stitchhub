import React from "react";

interface ChatThreadSidebarProps {
  threads: any[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
}

export default function ChatThreadSidebar({
  threads,
  activeThreadId,
  onSelectThread,
}: ChatThreadSidebarProps) {
  return (
    <div className="w-1/3 border-r border-zinc-900/80 bg-zinc-950/20 flex flex-col">
      <div className="p-4 border-b border-zinc-900/80">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1 font-mono">
          Active Threads
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={`w-full text-left p-4 border-b border-zinc-900/60 hover:bg-zinc-900/40 transition-colors cursor-pointer ${
              activeThreadId === thread.id
                ? "bg-[#d4af37]/5 border-l-2 border-l-[#d4af37]"
                : "border-l-2 border-l-transparent"
            }`}
          >
            <div className="flex justify-between items-start mb-1 font-mono">
              <span
                className={`text-xs font-bold ${
                  activeThreadId === thread.id ? "text-[#d4af37]" : "text-zinc-300"
                }`}
              >
                {thread.id}
              </span>
              <span className="text-[10px] text-zinc-500">{thread.time}</span>
            </div>
            <p className="text-sm text-zinc-200 truncate mb-1">{thread.title}</p>
            <p className="text-xs truncate text-zinc-500">{thread.lastMessage}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
