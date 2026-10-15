import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import DisclaimerGate from "@/app/disclaimer-gate";
import DisclaimerText from "@/app/disclaimer-text";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "stockpairs",
  description:
    "Live board of meme coins paired with tokenized stocks and crypto on Solana and Robinhood Chain.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${ibmPlexMono.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        {children}
        <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 pt-4 pb-10 text-xs text-muted">
          <DisclaimerText />
          <p className="mt-2 font-mono tracking-widest uppercase">
            A{" "}
            <a
              href="https://www.chubbicorns.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Chubbicorns
            </a>{" "}
            project 🦄
          </p>
        </footer>
        <DisclaimerGate>
          <DisclaimerText />
        </DisclaimerGate>
      </body>
    </html>
  );
}
