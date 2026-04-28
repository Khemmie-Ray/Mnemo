interface SectionNumberProps {
  number: string;
  label: string;
}

export function SectionNumber({ number, label }: SectionNumberProps) {
  return (
    <div className="font-mono text-xs text-(--color-ink-faint) mb-4 tracking-[0.15em] uppercase">
      {number} / {label}
    </div>
  );
}
