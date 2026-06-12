"use client";

import React from "react";
import Image from "next/image";

const inputClass = "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/35 transition-all font-sans";
const labelClass = "text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 block";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "number" | "select" | "textarea" | "file";
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  step?: string;
  rows?: number;
  options?: { value: string; label: string }[];
  accept?: string;
  imagePreview?: string | null;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hiddenFileId?: string;
}

export default function FormField({
  label, name, type = "text", value, onChange, placeholder, required, disabled, step, rows,
  options, accept, imagePreview, onFileChange, hiddenFileId,
}: FormFieldProps) {
  if (type === "select" && options) {
    return (
      <div>
        <label className={labelClass}>{label}</label>
        <select name={name} value={value as string} onChange={onChange} className={inputClass}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div>
        <label className={labelClass}>{label}</label>
        <textarea
          name={name} required={required} rows={rows || 3}
          value={value as string} onChange={onChange}
          placeholder={placeholder}
          className={`${inputClass} resize-none`}
        />
      </div>
    );
  }

  if (type === "file") {
    return (
      <div>
        <label className={labelClass}>{label}</label>
        <div className="mt-1 flex items-center gap-4">
          <div className="h-16 w-16 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
            {imagePreview ? (
              <Image src={imagePreview} alt="Preview" width={64} height={64} className="h-full w-full object-cover" />
            ) : (
              <svg className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            )}
          </div>
          <input type="file" accept={accept} onChange={onFileChange} className="hidden" id={hiddenFileId} />
          <label htmlFor={hiddenFileId} className="cursor-pointer bg-white/5 border border-white/10 text-white hover:bg-white/10 px-4 py-2 rounded-lg text-xs font-bold transition-all">
            Select File
          </label>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type={type} name={name} required={required} disabled={disabled}
        value={value} onChange={onChange} placeholder={placeholder}
        step={step}
        className={`${inputClass} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
    </div>
  );
}
