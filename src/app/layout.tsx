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
  title: "MedERP Pro - Modern Healthcare ERP SaaS",
  description: "Enterprise Resource Planning & CRM suite for Pharmaceutical Companies, Distributors, Stockists, and Medical Representatives.",
  keywords: "Medical ERP, Pharma SaaS, Inventory Management, CRM, MR Reporting, Ledger Accounting, Expiry Tracking",
  authors: [{ name: "MedERP Pro Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-emerald-500 selection:text-white dark:selection:bg-emerald-400 dark:selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
