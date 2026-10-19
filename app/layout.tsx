import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import DisclaimerGate from "@/app/disclaimer-gate";
import DisclaimerText from "@/app/disclaimer-text";
import { SITE_URL } from "@/lib/site";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const description =
  "The stock pairs dashboard for Robinhood Chain, plus Solana: find the meme coin paired with a tokenized stock, with live prices, charts and the risks in plain English.";

export const metadata: Metadata = {
  // Lets pages use relative links ("/pairs/knots") in share and SEO tags.
  metadataBase: new URL(SITE_URL),
  title: "stockpairs",
  description,
  openGraph: {
    siteName: "stockpairs",
    type: "website",
    title: "stockpairs",
    description,
  },
  // Big image previews on X instead of a small square.
  twitter: { card: "summary_large_image" },
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
