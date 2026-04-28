"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const Header = () => {
  const currentYear = new Date().getFullYear();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-4 z-50">
      <nav
        className={`lg:w-[80%] md:w-[80%] w-[90%] mx-auto flex items-center justify-between transition-all duration-300 ease-out
          rounded-full border
          ${
            scrolled
              ? "bg-(--color-paper)/80 backdrop-blur-md border-(--color-rule) shadow-[0_4px_20px_-8px_rgba(26,31,46,0.12)] px-6 py-3"
              : "bg-transparent border-transparent px-2 py-5"
          }`}
      >
        <div className="flex items-baseline gap-3">
          <Link href="/" className="group">
            <span className="font-serif lg:text-[24px] md:text-[24px] text-[20px] font-medium tracking-tight text-(--color-ink)">
              Mnemo
            </span>
          </Link>
          <span className="font-serif italic text-sm text-(--color-ink-faint) hidden sm:inline">
            est. {currentYear} · Onchain
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/onboarding"
            className="rounded-full text-[14px] font-medium bg-(--color-ink) text-(--color-paper) px-5 py-2.5 border border-(--color-ink)/10 hover:bg-(--color-paper) hover:text-(--color-ink) transition-colors"
          >
            open app →
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Header;