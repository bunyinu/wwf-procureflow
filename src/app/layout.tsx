import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Lora } from "next/font/google";

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const serif = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "TSC ProcureFlow — WWF-RDC",
  description:
    "Plateforme institutionnelle de gestion électronique des achats — WWF-RDC.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen bg-ink-50 font-sans text-ink-900 antialiased">
        {children}
      </body>
    </html>
  );
}
