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
  title: "Sivas Kirala - Kiralık Ürünler Platformu",
  description: "Sivas'ın en büyük kiralama platformu. Elektronik, giyim, kamp malzemeleri ve daha fazlasını kiralayın.",
  openGraph: {
    title: "Sivas Kirala - Kiralık Ürünler Platformu",
    description: "Sivas'ın en büyük kiralama platformu. Elektronik, giyim, kamp malzemeleri ve daha fazlasını kiralayın.",
    url: "https://sivas-kirala.web.app",
    siteName: "Sivas Kirala",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sivas Kirala - Kiralık Ürünler Platformu",
    description: "Sivas'ın en büyük kiralama platformu.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
