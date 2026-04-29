import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ContextProvider from "@/context";
import { headers } from "next/headers";
import { Toaster } from "sonner";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mnemo — A memory layer for AI agents",
  description:
    "User-owned memory and policy storage for AI agents. Built on 0G. Portable across every app you use.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="max-w-387.5 w-full mx-auto">
        <ContextProvider cookies={cookies}>
          <Toaster richColors />
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}
