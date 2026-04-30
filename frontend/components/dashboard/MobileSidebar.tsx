"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Squash as Hamburger } from "hamburger-react";

import {
  useAppKitAccount,
  useAppKitNetwork,
  useDisconnect,
} from "@reown/appkit/react";

const navItems = [
  { label: "Vault", href: "/dashboard", section: "i." },
  { label: "Chat", href: "/dashboard/chat", section: "ii." },
  { label: "Policies", href: "/dashboard/policies", section: "iii." },
];

const MobileSidebar = () => {
  const [isOpen, setOpen] = useState(false);

  const pathname = usePathname();
  const { address, status } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const { disconnect } = useDisconnect();

  const formatAddress = (addr: any) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      {/* Top bar */}
      <div className="lg:hidden md:hidden flex items-center justify-between px-4 py-4 border-b border-(--color-rule)">
        <Link href="/" className="font-serif text-xl text-(--color-ink)">
          Mnemo
        </Link>

        <Hamburger toggled={isOpen} toggle={setOpen} size={20} />
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[75%] max-w-xs bg-(--color-paper-shade) z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 pt-8 pb-6 border-b border-(--color-rule)">
          <div className="font-serif text-2xl text-(--color-ink)">
            Mnemo
          </div>
          <div className="font-serif italic text-xs text-(--color-ink-faint) mt-1">
            vol. i — your vault
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-baseline gap-3 px-3 py-2 transition-colors ${
                      isActive
                        ? "bg-(--color-paper) text-(--color-ink)"
                        : "text-(--color-ink-soft) hover:bg-(--color-paper)"
                    }`}
                  >
                    <span className="font-serif italic text-sm text-(--color-ink-faint)">
                      {item.section}
                    </span>
                    <span className="font-serif text-base">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Account info */}
          <div className="mt-10 px-3">
            <div className="font-mono text-[10px] text-(--color-ink-faint) uppercase mb-2">
              {status}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 bg-(--color-sage) rounded-full" />
              <span className="font-mono text-xs text-(--color-ink-soft)">
                {caipNetwork?.name}
              </span>
            </div>

            <code className="font-mono text-xs text-(--color-ink-faint)">
              {formatAddress(address)}
            </code>
          </div>
        </nav>

        <div className="absolute bottom-0 w-full px-4 py-6 border-t border-(--color-rule)">
          <button
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
            className="font-mono text-xs text-(--color-ink-soft) hover:text-(--color-ink) transition-colors"
          >
            disconnect
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;