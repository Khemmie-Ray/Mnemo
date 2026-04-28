import { ReactNode } from "react";

interface MarginaliaProps {
  label: string;
  children: ReactNode;
  position?: "top" | "middle";
}

export function Marginalia({
  label,
  children,
  position = "top",
}: MarginaliaProps) {
  const positionClass = position === "middle" ? "top-1/3" : "top-0";
  return (
    <div
      className={`hidden lg:block  ${positionClass} w-32  text-right`}
    >
      <div className="font-serif italic text-sm text-(--color-marginalia)">
        {label}
      </div>
      <div className="font-serif italic text-xs text-(--color-ink-faint) mt-2 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
