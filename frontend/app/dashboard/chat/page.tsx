"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useChat, type Message } from "@/hooks/useChat";
import { useSaveMemory } from "@/hooks/useSaveMemory";

export default function ChatPage() {
  const { messages, isThinking, error, sendMessage, markProposalResolved } =
    useChat();
  const {
    save,
    phase: savePhase,
    error: saveError,
    reset: resetSave,
  } = useSaveMemory();

  const [draft, setDraft] = useState("");
  const [pendingSaveId, setPendingSaveId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    if (savePhase === "done" && pendingSaveId) {
      toast.success("Saved to your vault");
      markProposalResolved(pendingSaveId);
      setPendingSaveId(null);
      resetSave();
    }
  }, [savePhase, pendingSaveId, markProposalResolved, resetSave]);

  useEffect(() => {
    if (savePhase === "error" && saveError) {
      toast.error(saveError);
    }
  }, [savePhase, saveError]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setDraft("");
  };

  const handleSaveProposal = async (msg: Message) => {
    if (!msg.proposedMemory) return;
    setPendingSaveId(msg.id);

    if (msg.proposedMemory.type === "saved_recipient") {
      const d = msg.proposedMemory.data;
      await save({
        type: "saved_recipient",
        data: {
          name: d.name,
          address: d.address as `0x${string}`,
          chain: d.chain,
          preferredToken: d.preferredToken,
          notes: d.notes,
        },
      });
    } else {
      const d = msg.proposedMemory.data;
      await save({
        type: "preference",
        data: { title: d.title, body: d.body },
      });
    }
  };

  const handleDiscardProposal = (msg: Message) => {
    markProposalResolved(msg.id);
    toast("Discarded");
  };

  return (
    <div className="max-w-4xl mx-auto px-8 md:px-12 py-12 min-h-screen flex flex-col">
      <header className="pb-6 border-b border-rule mb-10">
        <div className="font-mono text-xs text-ink-faint uppercase tracking-[0.15em] mb-2">
          today · session
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-ink">
          A conversation with your agent.
        </h1>
        <p className="font-serif italic text-sm text-marginalia mt-2">
          memory forms as you speak — each entry is logged to your vault.
        </p>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-10 overflow-y-auto">
        {messages.length === 0 && (
          <div className="font-serif italic text-base text-ink-faint pt-8">
            <p className="mb-3">— start a conversation.</p>
            <p className="text-sm">
              Try:{" "}
              <span className="text-ink">
                save my mom's address as 0x9f2c... on Celo with USDC
              </span>
            </p>
            <p className="text-sm mt-2">Or just say hello.</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="relative">
            <div className="flex items-baseline gap-3 mb-3">
              <span
                className={`font-serif italic text-sm ${
                  msg.role === "user" ? "text-ink" : "text-marginalia"
                }`}
              >
                {msg.role === "user" ? "you —" : "the agent —"}
              </span>
              <span className="font-mono text-[10px] text-ink-faint">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div
              className={
                msg.role === "user"
                  ? "pl-6 border-l-2 border-ink"
                  : "pl-6 border-l-2 border-dashed border-marginalia"
              }
            >
              <p className="font-serif text-lg text-ink leading-relaxed">
                {msg.content}
              </p>

              {msg.proposedMemory && !msg.proposalResolved && (
                <ProposalCard
                  msg={msg}
                  onSave={() => handleSaveProposal(msg)}
                  onDiscard={() => handleDiscardProposal(msg)}
                  isSaving={pendingSaveId === msg.id}
                  savePhase={savePhase}
                />
              )}

              {msg.proposalResolved && (
                <div className="mt-3 font-mono text-[10px] text-sage">
                  ✓ saved to vault
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-baseline gap-3">
            <span className="font-serif italic text-sm text-marginalia">
              the agent —
            </span>
            <span className="font-serif italic text-sm text-ink-faint">
              thinking…
            </span>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="mt-12 pt-6 border-t border-rule">
        <div className="font-serif italic text-sm text-marginalia mb-3">
          — your turn
        </div>
        <div className="bg-paper border border-rule focus-within:border-ink transition-colors">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tell your agent something to remember, or ask it to do something…"
            className="w-full bg-transparent px-5 py-4 font-serif text-base text-ink placeholder:text-ink-faint focus:outline-none resize-none"
            rows={3}
            disabled={isThinking}
          />
          <div className="flex items-center justify-between px-5 py-3 border-t border-dashed border-rule">
            <span className="font-mono text-xs text-ink-faint">
              {draft.length} chars · enter ↵ to send · shift+enter for newline
            </span>
            <button
              onClick={handleSend}
              disabled={!draft.trim() || isThinking}
              className="text-[14px] font-medium bg-ink text-paper px-4 py-2 hover:bg-paper hover:text-ink border border-ink transition-colors disabled:opacity-40"
            >
              send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProposalCard({
  msg,
  onSave,
  onDiscard,
  isSaving,
  savePhase,
}: {
  msg: Message;
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  savePhase: string;
}) {
  if (!msg.proposedMemory) return null;

  const label =
    msg.proposedMemory.type === "saved_recipient"
      ? "save as recipient"
      : "save as preference";

  const detail = (() => {
    if (msg.proposedMemory.type === "saved_recipient") {
      const d = msg.proposedMemory.data;
      return (
        <>
          <div className="font-serif text-base text-ink">{d.name}</div>
          <div className="font-mono text-[11px] text-ink-faint mt-1 break-all">
            {d.address}
          </div>
          <div className="font-serif italic text-sm text-ink-soft mt-1">
            {d.chain} · {d.preferredToken}
            {d.notes ? ` · ${d.notes}` : ""}
          </div>
        </>
      );
    }
    const d = msg.proposedMemory.data;
    return (
      <>
        <div className="font-serif text-base text-ink">{d.title}</div>
        <div className="font-serif italic text-sm text-ink-soft mt-1">
          {d.body}
        </div>
      </>
    );
  })();

  const buttonLabel = (() => {
    if (!isSaving) return "save";
    if (savePhase === "uploading_chunk") return "uploading…";
    if (savePhase === "uploading_manifest") return "updating manifest…";
    if (savePhase === "signing") return "confirm in wallet…";
    if (savePhase === "confirming") return "saving on chain…";
    return "saving…";
  })();

  return (
    <div className="mt-4 p-4 bg-paper-shade border border-rule">
      <div className="flex items-center justify-between mb-3">
        <span className="specimen-badge text-marginalia">{label}</span>
        <span className="font-mono text-[10px] text-ink-faint">
          should I remember this?
        </span>
      </div>
      <div className="mb-4">{detail}</div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="text-[13px] font-medium bg-ink text-paper px-4 py-2 hover:bg-paper hover:text-ink border border-ink transition-colors disabled:opacity-40"
        >
          {buttonLabel}
        </button>
        <button
          onClick={onDiscard}
          disabled={isSaving}
          className="text-[13px] font-medium bg-transparent text-ink-soft px-4 py-2 border border-rule hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
        >
          discard
        </button>
      </div>
    </div>
  );
}
