import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.warn("OPENAI_API_KEY is not set — chat will fail");
}

const openai = new OpenAI({ apiKey });

const SYSTEM_PROMPT = `You are Mnemo, a memory-aware AI agent. You help users save policies (recipients, preferences) to their on-chain vault and act on those policies (sending payments).

Always respond with a single JSON object matching this exact schema. Never include text outside the JSON.

{
  "intent": "chat" | "save_recipient" | "save_preference" | "send_payment",
  "reply": string,
  "proposed_memory": null | {
    "type": "saved_recipient",
    "data": { "name": string, "address": string, "chain": string, "preferredToken": string, "notes": string }
  } | {
    "type": "preference",
    "data": { "title": string, "body": string }
  },
  "proposed_action": null | {
    "type": "send_payment",
    "to": string,
    "amount": string,
    "token": string,
    "chain": string,
    "recipientName": string
  }
}

Rules:
- "intent" must reflect the user's primary intent
- "reply" is a short, warm message to the user (under 40 words)
- For "save_recipient" intent: extract name, address (must start with 0x), chain, preferredToken, optional notes. Set "proposed_memory". Set "proposed_action" to null.
- For "save_preference" intent: extract a short title and the body of the preference. Set "proposed_memory". Set "proposed_action" to null.
- For "send_payment" intent: identify the recipient by name, the amount, the token. Match the recipient's name against the user's saved recipients (provided in context). Set "proposed_action" with that recipient's address, chain, and preferred token. Set "proposed_memory" to null.
- For "chat" intent: respond conversationally. Set both "proposed_memory" and "proposed_action" to null.
- Never invent recipient addresses. If a payment intent references a recipient not in the saved list, set intent to "chat" and explain that the recipient isn't saved yet.
- Keep replies short. The user values concision.`;

type SavedRecipientContext = {
  name: string;
  address: string;
  chain: string;
  preferredToken: string;
};

type ChatRequest = {
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  recipients: SavedRecipientContext[];
  preferences: Array<{ title: string; body: string }>;
};

export async function POST(req: NextRequest) {
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI not configured" },
      { status: 500 },
    );
  }

  try {
    const body = (await req.json()) as ChatRequest;
    const { message, history, recipients, preferences } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing message" },
        { status: 400 },
      );
    }

    const contextLines: string[] = [];
    if (recipients.length > 0) {
      contextLines.push("Saved recipients:");
      for (const r of recipients) {
        contextLines.push(
          `- ${r.name}: ${r.address} on ${r.chain}, prefers ${r.preferredToken}`,
        );
      }
    }
    if (preferences.length > 0) {
      contextLines.push("Preferences:");
      for (const p of preferences) {
        contextLines.push(`- ${p.title}: ${p.body}`);
      }
    }
    const contextBlock =
      contextLines.length > 0
        ? `\n\nUser's vault context:\n${contextLines.join("\n")}`
        : "";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 250,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT + contextBlock },
        ...history.slice(-6), // last 3 turns of context
        { role: "user", content: message },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("Empty response from model");
    }

    const parsed = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Chat error:", err);
    const message = err instanceof Error ? err.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}