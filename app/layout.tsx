import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import DisclaimerGate from "@/app/disclaimer-gate";
import DisclaimerText from "@/app/disclaimer-text";
import { CONTACT, contactLinkProps, SITE_URL, STORE_URL } from "@/lib/site";
import chubbicorn from "@/public/brand/chubbicorn.png";
import { SITE_NAME } from "@/lib/brand";

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
  title: SITE_NAME,
  description,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    title: SITE_NAME,
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
          <aside className="mb-4 flex flex-wrap items-center gap-4 border border-foreground bg-surface p-4 text-sm text-foreground">
            <Image src={chubbicorn} alt="" className="h-14 w-auto shrink-0" />
            <p className="min-w-48 flex-1">
              <span className="font-semibold">Like the unicorn?</span> Get
              Chubbicorns tees, hoodies, caps and stickers.
            </p>
            <a
              href={STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-foreground bg-acid px-3 py-2 font-mono text-xs font-semibold whitespace-nowrap text-acid-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-[#17100c]"
            >
              Store.Chubbicorns.com ↗
            </a>
          </aside>
          {/* Everyone agrees to the full text in the pop-up first, so the
              footer keeps a one-line summary and the rest one tap away. */}
          <p>
            <strong className="text-foreground">Not financial advice.</strong>{" "}
            Data can be wrong, tokenized stocks aren&apos;t stocks, and meme
            coins can go to zero. Do your own research.
          </p>
          <details className="group">
            <summary className="cursor-pointer font-semibold text-foreground list-none underline hover:text-orange [&::-webkit-details-marker]:hidden">
              Read the full disclaimer{" "}
              <span
                aria-hidden="true"
                className="inline-block group-open:rotate-90"
              >
                ▸
              </span>
            </summary>
            <div className="mt-2 flex flex-col gap-2">
              <DisclaimerText />
            </div>
          </details>
          {CONTACT && (
            <p className="mt-2">
              Want your token listed, or spotted a mistake?{" "}
              {CONTACT.email && "Email "}
              <a
                {...contactLinkProps(CONTACT)}
                className="font-semibold text-foreground underline hover:text-orange"
              >
                {CONTACT.email ?? "Contact us ↗"}
              </a>
            </p>
          )}
          <p className="mt-2 flex items-center gap-2 font-mono tracking-widest uppercase">
            <Image src={chubbicorn} alt="" className="h-7 w-auto" />
            <span>
              A{" "}
              <a
                href="https://www.chubbicorns.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Chubbicorns
              </a>{" "}
              project
            </span>
          </p>
        </footer>
        <DisclaimerGate>
          <DisclaimerText />
        </DisclaimerGate>
        <Analytics />
      </body>
    </html>
  );
}
