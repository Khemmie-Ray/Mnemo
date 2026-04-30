import { ReactNode } from "react";

interface SpecimenCardProps {
  type: string;
  typeColor?: "marginalia" | "sage" | "fountain" | "stamp";
  timestamp: string;
  title: string;
  body: string;
  hash?: string;
  children?: ReactNode;
}

const colorMap = {
  marginalia: "text-[var(--color-marginalia)]",
  sage: "text-[var(--color-sage)]",
  fountain: "text-[var(--color-fountain)]",
  stamp: "text-[var(--color-stamp)]",
};

export function SpecimenCard({
  type,
  typeColor = "marginalia",
  timestamp,
  title,
  body,
  hash,
  children,
}: SpecimenCardProps) {
  return (
    <div className="bg-(--color-paper) border border-(--color-rule) hover:border-(--color-ink-whisper) transition-colors p-5 group cursor-pointer lg:w-[32%] md:w-[32%] w-full mb-4">
      <header className="flex items-center justify-between mb-3">
        <span className={`specimen-badge ${colorMap[typeColor]}`}>{type}</span>
        <span className="font-mono text-[10px] text-(--color-ink-faint)">
          {timestamp}
        </span>
      </header>

      <h3 className="font-serif text-lg text-(--color-ink) mb-2 leading-snug">
        {title}
      </h3>

      <p className="text-sm text-(--color-ink-soft) leading-relaxed">
        {body}
      </p>

      {children && <div className="mt-3">{children}</div>}

      {hash && (
        <footer className="mt-4 pt-3 border-t border-dashed border-(--color-rule) flex items-center justify-between">
          <code className="font-mono text-[10px] text-(--color-ink-faint)">
            {hash}
          </code>
          <span className="font-mono text-[10px] text-(--color-ink-faint) opacity-0 group-hover:opacity-100 transition-opacity">
            view on 0g →
          </span>
        </footer>
      )}
    </div>
  );
}
