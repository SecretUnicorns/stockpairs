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
            advice. Token and stock pairings and contract addresses may be
            inaccurate or out of date — always verify a contract address
            yourself before you trade. Crypto and tokenized stocks are risky,
            and we are not responsible for your losses.
          </p>
        </footer>
      </body>
    </html>
  );
}
