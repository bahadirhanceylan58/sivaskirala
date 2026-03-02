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
  title: {
    default: "Sivas Kirala — Sivas'ın Kiralama Platformu",
    template: "%s | Sivas Kirala",
  },
  description: "Sivas'ta elektronik, kamp malzemeleri, abiye, organizasyon ekipmanları ve daha fazlasını günlük kiralayın. Güvenli, hızlı, uygun fiyatlı.",
  keywords: ["sivas kiralık", "kiralama sivas", "günlük kiralık", "elektronik kiralık sivas", "kamp malzemeleri kiralık"],
  metadataBase: new URL("https://sivaskirala.vercel.app"),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Sivas Kirala — Sivas'ın Kiralama Platformu",
    description: "Sivas'ta her şeyi günlük kirala. Elektronik, giyim, kamp malzemeleri ve daha fazlası.",
    url: "https://sivaskirala.vercel.app",
    siteName: "Sivas Kirala",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Sivas Kirala" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sivas Kirala — Sivas'ın Kiralama Platformu",
    description: "Sivas'ta her şeyi günlük kirala.",
    images: ["/og-image.png"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sivas Kirala" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
