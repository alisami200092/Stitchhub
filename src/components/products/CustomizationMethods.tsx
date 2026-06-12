// ──────────────────────────────────────────────
// CustomizationMethods — Displays the eligible embroidery / print methods for a product
// ──────────────────────────────────────────────

interface CustomizationMethodsProps {
  /** Comma- or bullet-separated list of available customization methods (e.g. "Embroidery, Screen Print") */
  methods: string;
}

export default function CustomizationMethods({ methods }: CustomizationMethodsProps) {
  return (
    <div className="mb-8">
      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
        Customization Methods
      </label>
      <div className="text-sm font-semibold text-zinc-300 bg-zinc-900/80 rounded-xl px-4 py-3 border border-zinc-800/80">
        {methods}
      </div>
    </div>
  );
}
