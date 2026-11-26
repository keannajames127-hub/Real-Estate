import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import "./globals.css";

const displaySerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display-serif",
  display: "swap",
});

const sansBody = Inter({
  subsets: ["latin"],
  variable: "--font-sans-body",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Danish Home Properties — Discover Exceptional Properties",
    template: "%s | Danish Home Properties",
  },
  description:
    "Danish Home Properties is a boutique luxury real estate brokerage representing architecturally significant homes across California and the West Coast.",
  keywords: [
    "luxury real estate",
    "California luxury homes",
    "Orange County real estate",
    "Garden Grove homes",
    "boutique brokerage",
  ],
  authors: [{ name: "Danish Home Properties" }],
  creator: "Danish Home Properties",
  openGraph: {
    type: "website",
    siteName: "Danish Home Properties",
    title: "Danish Home Properties — Discover Exceptional Properties",
    description:
      "A curated collection of California's finest homes, presented with discretion and care.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Danish Home Properties",
    description: "Discover exceptional properties across California.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#052b4f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${displaySerif.variable} ${sansBody.variable}`}>
      <body className="min-h-screen bg-paper antialiased">{children}</body>
    </html>
  );
}
