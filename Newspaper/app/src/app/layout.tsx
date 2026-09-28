import type { Metadata } from "next";
import { Newsreader, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"] });
const sourceSerif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400","500","600","700"] });

export const metadata: Metadata = {
  title: "Evoford Journal",
  description: "Independent reporting · intelligence · perspective — London · Dominican Republic · Latin America.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="es" className={`${newsreader.variable} ${sourceSerif.variable} ${plexMono.variable} h-full antialiased`}>
    <body className="min-h-full bg-[#f7f4ec] text-[#171714]">{children}</body>
  </html>;
}