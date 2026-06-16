"use client";

import React, { useRef } from "react";

interface CheckoutFormProps {
  toEmail: string;
  setToEmail: (val: string) => void;
  subject: string;
  setSubject: (val: string) => void;
  message: string;
  setMessage: (val: string) => void;
  isSuccess: boolean;
  attachedFiles: File[];
  setAttachedFiles: (files: File[]) => void;
}

export default function CheckoutForm({
  toEmail,
  setToEmail,
  subject,
  setSubject,
  message,
  setMessage,
  isSuccess,
  attachedFiles,
  setAttachedFiles,
}: CheckoutFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachedFiles([...attachedFiles, ...filesArray]);
    }
  };

  // 🔍 Detect escalation from AI response
  const isEscalated = message.includes("<action>PAUSE</action>") || message.includes("escalate_to_admin");

  // ==========================================
  // 📥 INBOX THREAD VIEW (Triggers after AI responds)
  // ==========================================
  if (isSuccess) {
    return (
      <div className="flex flex-col h-full animate-scaleIn space-y-6">
        {/* Thread Header */}
        <div className="border-b border-zinc-800 pb-4">
          <h2 className="text-xl font-bold text-white font-display">Active Request</h2>
          <p className="text-xs text-zinc-500 mt-1">Ref: {subject}</p>
        </div>

        {/* AI Agent Message Card */}
        <div className={`rounded-2xl border p-6 shadow-2xl relative overflow-hidden transition-all duration-500 ${
          isEscalated ? "bg-[#1a0f14] border-red-900/50" : "bg-[#121316] border-zinc-800"
        }`}>
          {/* Ambient Card Glow */}
          <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[90px] pointer-events-none ${
            isEscalated ? "bg-red-600/10" : "bg-[#d4af37]/10"
          }`} />

          <div className="flex items-start gap-4 relative z-10">
            {/* Agent Avatar */}
            <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center border ${
              isEscalated ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-[#d4af37]/10 border-[#d4af37]/30 text-[#d4af37]"
            }`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            {/* Message Payload */}
            <div className="flex-1 space-y-1 mt-0.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white tracking-wide">StitchHub Assistant</span>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Just Now</span>
              </div>
              
              {isEscalated ? (
                <div className="pt-3">
                  <span className="inline-block bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                    Admin Escalation Triggered
                  </span>
                  <p className="text-sm text-red-200/90 leading-relaxed font-mono whitespace-pre-wrap">
                    {message.replace("<action>PAUSE</action>", "").trim()}
                  </p>
                </div>
              ) : (
                <div className="pt-3">
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-body">
                    {message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Brevo Notification Status */}
        <div className="flex items-center justify-center gap-2 pt-4 opacity-80">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <p className="text-xs text-zinc-400 font-medium tracking-wide">
            A copy has been sent to your email.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 📝 COMPOSER VIEW (Default State)
  // ==========================================
  return (
    <div className="space-y-6 animate-scaleIn h-full flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
            To
          </label>
          <input
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            className="w-full bg-[#121316] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none transition-all"
            placeholder="Enter email address"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
            Subject Line
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-[#121316] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none transition-all"
            placeholder="Enter subject"
          />
        </div>
      </div>

      {/* Message Editor */}
      <div className="flex-1 min-h-75">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`w-full h-full border rounded-xl p-5 text-sm leading-relaxed font-body focus:outline-none resize-none transition-all duration-300 ${
            isEscalated 
              ? "bg-red-500/5 border-red-500/30 text-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono" 
              : "bg-[#121316]/50 border-zinc-800 text-zinc-300 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
          }`}
          placeholder="Include any specific requirements, timelines, or details..."
        />
      </div>

      {/* File Attachments Zone */}
      <div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          type="button"
          className="w-full border border-dashed border-zinc-800 rounded-xl p-4 flex items-center justify-center hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 transition-all cursor-pointer group"
        >
          <span className="flex items-center gap-2.5 text-xs text-zinc-400 group-hover:text-[#d4af37] font-medium transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Attach artwork or reference files
          </span>
        </button>
      </div>
    </div>
  );
}