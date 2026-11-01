import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/system/SmoothScroll";
import Cursor from "@/components/system/Cursor";
import ThemeController from "@/components/system/ThemeController";
import CookieConsent from "@/components/system/CookieConsent";
import { LanguageProvider } from "@/lib/i18n";
import { PROFILE } from "@/lib/content";

/* Fuentes autoalojadas en app/fonts (woff2, subconjunto latin, licencia
   OFL 1.1). Así la build no descarga nada de Google Fonts: con
   next/font/google, Turbopack fallaba de forma intermitente al resolver
   las fuentes durante la compilación. */
const anton = localFont({
  src: "./fonts/anton-400.woff2",
  weight: "400",
  variable: "--font-anton",
});

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-var.woff2",
  weight: "300 700",
  variable: "--font-space-grotesk",
});

const plexMono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex-mono",
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
