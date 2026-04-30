import { NextRequest, NextResponse } from "next/server";
import { uploadJsonToZeroG } from "@/lib/zerog/upload";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object" || !body.owner) {
      return NextResponse.json(
        { error: "Invalid manifest payload" },
        { status: 400 }
      );
    }

    const { rootHash, txHash } = await uploadJsonToZeroG(body);

    return NextResponse.json({ rootHash, txHash });
  } catch (err) {
    console.error("0G upload failed:", err);
    const message =
      err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}