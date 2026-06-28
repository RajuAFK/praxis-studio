import type { Metadata } from "next";
import { Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MediaPreferenceProvider } from "@/components/MediaPreference";
import { MediaGate } from "@/components/MediaGate";

const display = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://praxivision.com"),
  title: {
    default:
      "Praxivision — Heritage Documentation, 360° Tours, Photogrammetry & Gaussian Splatting",
    template: "%s · Praxivision",
  },
  description:
    "Digital documentation studio for museums and heritage organizations. Photogrammetry, gaussian splats, 360° virtual tours, gigapixel imagery, and archival photography — Hyderabad, since 1992.",
  applicationName: "Praxivision",
  authors: [{ name: "Praxivision Private Limited" }],
  keywords: [
    "heritage documentation",
    "museum 3d scanning",
    "gaussian splatting",
    "photogrammetry",
    "360 virtual tour",
    "gigapixel imagery",
    "industrial photography",
    "Hyderabad",
    "cultural heritage",
  ],
  alternates: {
    canonical: "https://praxivision.com/",
  },
  openGraph: {
    type: "website",
    siteName: "Praxivision",
    title:
      "Praxivision — Heritage Documentation Studio · Hyderabad · Since 1992",
    description:
      "Photogrammetry, gaussian splatting, 360° virtual tours, gigapixel imagery, and archival photography for museums and heritage organizations.",
    url: "https://praxivision.com/",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Praxivision — Heritage Documentation Studio",
    description:
      "Photogrammetry, gaussian splats, 360° virtual tours, gigapixel, photography for museums and cultural institutions.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        <MediaPreferenceProvider>
          <MediaGate />
          {children}
        </MediaPreferenceProvider>
      </body>
    </html>
  );
}
