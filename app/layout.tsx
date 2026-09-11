import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "stockpairs",
  description: "stockpairs",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col">
        {children}
        <footer className="p-4 text-center text-sm">
          <p>
            stockpairs is for informational purposes only and is not financial
            advice. We did not create, launch, or issue any of the tokens
            listed, and we are not affiliated with any of them or their
            projects.
          </p>
          <p>
            Token and stock pairings and contract addresses may be inaccurate
            or out of date, and any token may be a scam or a honeypot (a token
            you can buy but can&apos;t sell). Always verify the contract address
            and do your own research before you trade.
          </p>
          <p>
            We are not responsible for any losses, including losses from
            honeypots, scams, rug pulls, or incorrect information on this site.
            Crypto and tokenized stocks are highly risky — use this site at
            your own risk.
          </p>
        </footer>
      </body>
    </html>
  );
}
