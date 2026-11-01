import type { Metadata, Viewport } from "next";
import { Anton, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/system/SmoothScroll";
import Cursor from "@/components/system/Cursor";
import ThemeController from "@/components/system/ThemeController";
import CookieConsent from "@/components/system/CookieConsent";
import { LanguageProvider } from "@/lib/i18n";
import { PROFILE } from "@/lib/content";

const anton = Anton({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const TITLE = "Gabriel Rodríguez — Independent Developer";
const DESCRIPTION =
  "Desarrollador independiente: productos digitales, experiencias web y sistemas inteligentes con Next.js, React, Node.js e IA.";

export const metadata: Metadata = {
  metadataBase: new URL("https://gabrielrodriguez.dev"),
  title: {
    default: TITLE,
    template: "%s · Gabriel Rodríguez",
  },
  description: DESCRIPTION,
  keywords: [
    "Gabriel Rodríguez",
    "Independent Developer",
    "Frontend Developer",
    "Fullstack Developer",
    "Creative Developer",
    "Next.js",
    "React",
    "TypeScript",
    "Automatización IA",
  ],
  authors: [{ name: "Gabriel Rodríguez" }],
  creator: "Gabriel Rodríguez",
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    siteName: "Gabriel Rodríguez",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#f0efe9",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PROFILE.name,
  jobTitle: "Independent Developer",
  email: `mailto:${PROFILE.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Mérida", addressCountry: "ES" },
  sameAs: PROFILE.links.map((l) => l.href),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-theme="light"
      className={`${anton.variable} ${spaceGrotesk.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <ThemeController />
          <Cursor />
          <CookieConsent />
        </LanguageProvider>
      </body>
    </html>
  );
}
