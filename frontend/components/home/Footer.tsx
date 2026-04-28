import Link from "next/link";

const links = [
  { label: "built on 0g", href: "https://0g.ai" }
];



const Footer = () => {
  return (
    <footer className="border-t border-(--color-rule) mt-16">
      <div className="w-[90%] mx-auto px-6 md:px-10 py-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="font-serif text-xl text-(--color-ink) mb-2">
            Mnemo
          </div>
          <div className="font-serif italic text-sm text-(--color-ink-faint)">
            built in onchain, for the open agent economy
          </div>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs">
          <p>All Rights Reserved - Team Mnemo</p>
        </div>
      </div>

      <div className="border-t border-(--color-rule)]">
        <div className="w-[90%] mx-auto px-6 md:px-10 py-4 flex justify-between items-center font-mono text-xs text-(--color-ink-faint)">
          <span>vol. i, no. 1</span>
            <Link
              href="https://0g.ai"
              className="text-(--color-ink-soft) hover:text-(--color-ink) transition-colors"
            >
              built on 0g
            </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer