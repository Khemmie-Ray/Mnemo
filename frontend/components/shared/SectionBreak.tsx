interface SectionBreakProps {
  symbol?: string;
}

export function SectionBreak({ symbol = "§" }: SectionBreakProps) {
  return (
    <div className="section-break my-16">
      <span className="font-serif italic text-base">{symbol}</span>
    </div>
  );
}
