import type { Metadata } from "next";
import localFont from "next/font/local";
import { Bungee_Shade } from "next/font/google";
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
    </html>
  );
}
