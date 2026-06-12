"use client";

interface DancingDotsProps {
  color?: "emerald" | "red" | "gold";
}

const colorMap = {
  emerald: "bg-emerald-400",
  red: "bg-red-500",
  gold: "bg-[#d4af37]",
};

export default function DancingDots({ color = "emerald" }: DancingDotsProps) {
  return (
    <span className="flex items-center gap-[3px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${colorMap[color]}`}
          style={{
            animation: "dance 1s infinite ease-in-out",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </span>
  );
}
