import type { Metadata } from "next";
import localFont from "next/font/local";
import { Bungee_Shade } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const blMelody = localFont({
  src: [
    { path: "../public/fonts/BLMelody-Book.otf",     weight: "350", style: "normal" },
    { path: "../public/fonts/BLMelody-Regular.otf",  weight: "400", style: "normal" },
    { path: "../public/fonts/BLMelody-Medium.otf",   weight: "500", style: "normal" },
    { path: "../public/fonts/BLMelody-SemiBold.otf", weight: "600", style: "normal" },
  ],
  variable: "--font-bl-melody",
  display: "swap",
});

const bungeeShade = Bungee_Shade({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bungee-shade",
  display: "swap",
});

export const metadata: Metadata = {
  // Absolute base for resolving og:image and other relative URLs —
  // social scrapers require absolute URLs.
  metadataBase: new URL("https://fatimacunha.com"),
  title: {
    default: "Fátima Cunha",
    // Child pages set a bare title (e.g. "About") → "About — Fátima Cunha".
    template: "%s — Fátima Cunha",
  },
  description: "Portfolio of Fátima Cunha, senior product designer.",
  openGraph: {
    type: "website",
    siteName: "Fátima Cunha",
    title: "Fátima Cunha",
    description: "Portfolio of Fátima Cunha, senior product designer.",
    url: "https://fatimacunha.com",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Fátima Cunha — senior product designer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fátima Cunha",
    description: "Portfolio of Fátima Cunha, senior product designer.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${blMelody.variable} ${bungeeShade.variable}`}>
      <body>{children}</body>
      {/* Plausible Analytics — privacy-friendly, no cookies. Auto-tracks
          App Router soft navigations via History API hooks, including
          ?project=… query strings (which Cloudflare collapses). */}
      <Script
        defer
        src="https://plausible.io/js/pa-QZORQJrrw0GHNktv3ZqmE.js"
        strategy="afterInteractive"
      />
      <Script id="plausible-init" strategy="afterInteractive">
        {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
      </Script>
    </html>
  );
}
