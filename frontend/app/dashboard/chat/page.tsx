"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useChat, type Message } from "@/hooks/useChat";
import { useSaveMemory } from "@/hooks/useSaveMemory";
import { usePaymentExecution, type ReasoningStep,} from "@/hooks/usePaymentExecution";
import Link from "next/link";

export default function ChatPage() {
  const { messages, isThinking, error, sendMessage, markProposalResolved } =
    useChat();
  const {
    save,
    phase: savePhase,
    error: saveError,
    reset: resetSave,
  } = useSaveMemory();

  const {
    execute: executePayment,
    finalizeIfConfirmed,
    phase: paymentPhase,
    steps: reasoningSteps,
    error: paymentError,
    txHash: paymentTxHash,
    reset: resetPayment,
  } = usePaymentExecution();

const [pendingPaymentMessageId, setPendingPaymentMessageId] = useState<string | null>(null);

  // Auto-finalize when transaction confirms
  useEffect(() => {
    const pendingMsg = messages.find((m) => m.id === pendingPaymentMessageId);
    if (pendingMsg?.proposedAction) {
      finalizeIfConfirmed(pendingMsg.proposedAction);
    }
  }, [paymentPhase, pendingPaymentMessageId, messages, finalizeIfConfirmed]);

  // Surface payment success
  useEffect(() => {
    if (paymentPhase === "done" && pendingPaymentMessageId) {
      toast.success("Payment sent and logged to your vault");
      markProposalResolved(pendingPaymentMessageId);
      setPendingPaymentMessageId(null);
      resetPayment();
    }
  }, [
    paymentPhase,
    pendingPaymentMessageId,
    markProposalResolved,
    resetPayment,
  ]);

  // Surface payment errors
  useEffect(() => {
    if (paymentPhase === "error" && paymentError) {
      toast.error(paymentError);
    }
  }, [paymentPhase, paymentError]);

  const handleExecutePayment = async (msg: Message) => {
    if (!msg.proposedAction) return;
    setPendingPaymentMessageId(msg.id);
    await executePayment(msg.proposedAction);
  };

  const handleDiscardPayment = (msg: Message) => {
    markProposalResolved(msg.id);
    toast("Discarded");
  };

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
              {msg.proposedAction && !msg.proposalResolved && (
                <PaymentCard
                  msg={msg}
                  onExecute={() => handleExecutePayment(msg)}
                  onDiscard={() => handleDiscardPayment(msg)}
                  isExecuting={pendingPaymentMessageId === msg.id}
                  phase={paymentPhase}
                  steps={reasoningSteps}
                  txHash={paymentTxHash}
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

function PaymentCard({
  msg,
  onExecute,
  onDiscard,
  isExecuting,
  phase,
  steps,
  txHash,
}: {
  msg: Message;
  onExecute: () => void;
  onDiscard: () => void;
  isExecuting: boolean;
  phase: string;
  steps: ReasoningStep[];
  txHash: string | null;
}) {
  if (!msg.proposedAction) return null;

  const a = msg.proposedAction;

  const buttonLabel = (() => {
    if (!isExecuting) return "send payment";
    if (phase === "reasoning") return "thinking…";
    if (phase === "awaiting_signature") return "confirm in wallet…";
    if (phase === "broadcasting") return "broadcasting…";
    if (phase === "confirming") return "confirming…";
    if (phase === "logging") return "logging to vault…";
    return "sending…";
  })();

  return (
    <div className="mt-4 p-4 bg-paper-shade border border-rule">
      <div className="flex items-center justify-between mb-3">
        <span className="specimen-badge text-fountain">propose payment</span>
        <span className="font-mono text-[10px] text-ink-faint">
          should I send this?
        </span>
      </div>

      <div className="mb-4">
        <div className="font-serif text-base text-ink">
          {a.amount} {a.token} → {a.recipientName}
        </div>
        <div className="font-mono text-[11px] text-ink-faint mt-1 break-all">
          {a.to}
        </div>
        <div className="font-serif italic text-sm text-ink-soft mt-1">
          on {a.chain}
        </div>
      </div>

      {/* Reasoning trace — only visible when executing */}
      {isExecuting && steps.length > 0 && (
        <div className="mb-4 border-l-2 border-marginalia pl-4 py-2 space-y-1.5">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`font-serif italic text-sm transition-opacity ${
                step.state === "pending"
                  ? "text-ink-faint opacity-40"
                  : step.state === "active"
                    ? "text-marginalia"
                    : "text-sage"
              }`}
            >
              <span className="font-mono text-xs mr-2">
                {step.state === "done"
                  ? "✓"
                  : step.state === "active"
                    ? "·"
                    : " "}
              </span>
              {step.label}
            </div>
          ))}
        </div>
      )}

      {/* Tx hash link once we have one */}
      {txHash && (phase === "confirming" || phase === "logging" || phase === "done") && (
        <div className="mb-4 font-mono text-[10px] text-ink-faint">
          tx:{" "}
          <Link
            href={`https://chainscan-galileo.0g.ai/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fountain hover:text-fountain-deep border-b border-fountain"
          >
            {txHash.slice(0, 10)}…{txHash.slice(-8)}
          </Link>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onExecute}
          disabled={isExecuting}
          className="text-[13px] font-medium bg-ink text-paper px-4 py-2 hover:bg-paper hover:text-ink border border-ink transition-colors disabled:opacity-40"
        >
          {buttonLabel}
        </button>
        <button
          onClick={onDiscard}
          disabled={isExecuting}
          className="text-[13px] font-medium bg-transparent text-ink-soft px-4 py-2 border border-rule hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
        >
          cancel
        </button>
      </div>
    </div>
  );
}