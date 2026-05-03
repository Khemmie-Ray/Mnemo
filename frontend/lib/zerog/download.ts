"use client";

export async function downloadJsonFromZeroG<T = unknown>(
  rootHash: string,
): Promise<T> {
  if (!rootHash || !rootHash.startsWith("0x")) {
    throw new Error(`Invalid rootHash: ${rootHash}`);
  }

  const res = await fetch("/api/storage/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rootHash }),
  });

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}));
    throw new Error(error ?? `Download failed with status ${res.status}`);
  }

  const { data } = (await res.json()) as { data: T };
  return data;
}