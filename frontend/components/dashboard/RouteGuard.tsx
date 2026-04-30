"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAgentStatus } from "@/hooks/useAgentStatus";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isRegistered, isLoading, address } = useAgentStatus();

  useEffect(() => {
    if (isLoading) return;

    if (!address) {
      router.replace("/onboarding");
      return;
    }

    if (!isRegistered) {
      router.replace("/onboarding");
      return;
    }
  }, [isLoading, address, isRegistered, router]);

  
  if (isLoading || !address || !isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-serif italic text-sm text-ink-faint flex items-center gap-3">
          <span className="block w-8 h-px bg-marginalia opacity-40" />
          consulting your vault…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}