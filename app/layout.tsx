import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Praxium ERP",
    template: "%s | Praxium",
  },
  description: "A premium, minimalist dashboard for coaching institutes and educational centers.",
  metadataBase: new URL("https://praxium-erp.vercel.app"),
  openGraph: {
    title: "Praxium ERP — Premium Educational Management Platform",
    description: "The enterprise-grade portal for coaching institutes. Elevating school operations, fee collection, and attendance tracking with a high-fidelity interface.",
    url: "https://praxium-erp.vercel.app",
    siteName: "Praxium ERP",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Praxium ERP - Premium Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Praxium ERP — Premium Educational Management Platform",
    description: "The enterprise-grade portal for coaching institutes. Elevating school operations, fee collection, and attendance tracking with a high-fidelity interface.",
    images: ["/og-image.png"],
    creator: "@praxium_erp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
