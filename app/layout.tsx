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
  title: "Praxis Studio — Industrial Photography · Hyderabad · Est. 1992",
  description:
    "A department of Praxivision Pvt Ltd. Industrial photography, gigapixel imagery, 360° tours, photogrammetry, and gaussian splat capture.",
  metadataBase: new URL("https://praxis.photo"),
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
