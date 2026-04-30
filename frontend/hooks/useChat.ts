"use client";

import { useState, useCallback } from "react";
import { useVault } from "@/hooks/useVault";

export type ChatIntent =
  | "chat"
  | "save_recipient"
  | "save_preference"
  | "send_payment";

export type ProposedMemory =
  | {
      type: "saved_recipient";
      data: {
        name: string;
        address: string;
        chain: string;
        preferredToken: string;
        notes: string;
      };
    }
  | {
      type: "preference";
      data: { title: string; body: string };
    };

export type ProposedAction = {
  type: "send_payment";
  to: string;
  amount: string;
  token: string;
  chain: string;
  recipientName: string;
};

export type AgentResponse = {
  intent: ChatIntent;
  reply: string;
  proposed_memory: ProposedMemory | null;
  proposed_action: ProposedAction | null;
};

export type Message = {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
  proposedMemory?: ProposedMemory | null;
  proposedAction?: ProposedAction | null;
  proposalResolved?: boolean;
};

function makeId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useChat() {
  const { data: vaultData } = useVault();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isThinking) return;

      setError(null);

      const userMessage: Message = {
        id: makeId(),
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsThinking(true);

      try {
        const recipients =
          vaultData?.recipients.map((r) => ({
            name: r.name,
            address: r.address,
            chain: r.chain,
            preferredToken: r.preferredToken,
          })) ?? [];

        const preferences =
          vaultData?.preferences.map((p) => ({
            title: p.title,
            body: p.body,
          })) ?? [];

        const history = messages.slice(-6).map((m) => ({
          role: m.role === "agent" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history,
            recipients,
            preferences,
          }),
        });

        if (!res.ok) {
          const { error: e } = await res.json().catch(() => ({}));
          throw new Error(e ?? "Chat request failed");
        }

        const data = (await res.json()) as AgentResponse;

        const agentMessage: Message = {
          id: makeId(),
          role: "agent",
          content: data.reply,
          timestamp: Date.now(),
          proposedMemory: data.proposed_memory,
          proposedAction: data.proposed_action,
        };
        setMessages((prev) => [...prev, agentMessage]);
      } catch (err) {
        const m = err instanceof Error ? err.message : "Chat failed";
        setError(m);
      } finally {
        setIsThinking(false);
      }
    },
    [isThinking, vaultData, messages],
  );

  const markProposalResolved = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, proposalResolved: true } : m,
      ),
    );
  }, []);

  return {
    messages,
    isThinking,
    error,
    sendMessage,
    markProposalResolved,
  };
}