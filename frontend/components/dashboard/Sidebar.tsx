"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useDisconnect } from "@reown/appkit/react";

const navItems = [
  { label: "Vault", href: "/dashboard", section: "i." },
  { label: "Chat", href: "/dashboard/chat", section: "ii." },
  { label: "Policies", href: "/dashboard/policies", section: "iii." },
]
;

const Sidebar = () => {
  const pathname = usePathname();
  const { address, status } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()
  const { disconnect } = useDisconnect();

  function formatAddress(addr:any) {
  if (!addr) return "";

  const start = addr.slice(0, 8);   // e.g. 0x56tybgt
  const end = addr.slice(-2);       // e.g. fr

  return `${start}******${end}`;
}

  return (
    <div className="w-[20%] h-screen border-r border-(--color-rule) bg-(--color-paper-shade) flex-col hidden lg:flex md:flex">
        <div className="px-6 pt-8 pb-6 border-b border-(--color-rule)">
          <Link href="/" className="font-serif text-2xl font-medium tracking-tight text-(--color-ink)">
            Mnemo
          </Link>
          <div className="font-serif italic text-xs text-(--color-ink-faint) mt-1">
            vol. i — your vault
          </div>
        </div>

        <nav className="flex-1 px-4 py-6">
          <div className="font-mono text-[10px] text-(--color-ink-faint) uppercase tracking-[0.15em] mb-3 px-2">
            Sections
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-baseline gap-3 px-3 py-2 transition-colors ${
                      isActive
                        ? "bg-(--color-paper) text-(--color-ink)"
                        : "text-(--color-ink-soft) hover:bg-(--color-paper) hover:text-(--color-ink)"
                    }`}
                  >
                    <span
                      className={`font-serif italic text-sm ${
                        isActive
                          ? "text-(--color-marginalia)"
                          : "text-(--color-ink-faint)"
                      }`}
                    >
                      {item.section}
                    </span>
                    <span className="font-serif text-base">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="font-mono text-[10px text-(--color-ink-faint) uppercase tracking-[0.15em] mb-3 px-2 mt-10">
            {status}
          </div>
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="block w-1.5 h-1.5 bg-(--color-sage) rounded-full" />
              <span className="font-mono text-xs text-(--color-ink-soft)">
                {caipNetwork?.name}
              </span>
            </div>
            <code className="font-mono text-xs text-(--color-ink-faint) block">
             {formatAddress(address)}
            </code>
          </div>
        </nav>

        <div className="px-4 py-6 border-t border-(--color-rule)">
          <button
          onClick={() => disconnect()}
            className="font-mono text-xs text-(--color-ink-soft) hover:text-(--color-ink) transition-colors block px-3 py-2 cursor-pointer hover:border hover:border-(--color-ink)"
          >
            disconnect
          </button>
        </div>
    </div>
  );
}

export default Sidebar