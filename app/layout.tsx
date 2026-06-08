import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import CookieConsent from "@/components/CookieConsent";
import { LanguageProvider } from "@/lib/i18n";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gabrielrodriguez.dev"),
  title: {
    default: "Gabriel Rodríguez — Frontend & Fullstack Developer",
    template: "%s · Gabriel Rodríguez",
  },
  description:
    "Desarrollador web Frontend especializado en Next.js, React y experiencias interactivas. Conocimientos de backend y automatización con IA.",
  keywords: [
    "Gabriel Rodríguez",
    "Frontend Developer",
    "Fullstack Developer",
    "Next.js",
    "React",
    "TypeScript",
    "Automatización IA",
  ],
  authors: [{ name: "Gabriel Rodríguez" }],
  creator: "Gabriel Rodríguez",
  openGraph: {
    title: "Gabriel Rodríguez — Frontend & Fullstack Developer",
    description:
      "Desarrollador web Frontend especializado en Next.js, React y experiencias interactivas. Backend y automatización con IA.",
    type: "website",
    locale: "es_ES",
    siteName: "Gabriel Rodríguez",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gabriel Rodríguez — Frontend & Fullstack Developer",
    description:
      "Desarrollador Frontend especializado en Next.js, React y experiencias interactivas.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${spaceGrotesk.variable} ${spaceGrotesk.className}`}>
        <LanguageProvider>
          <SmoothScroll>{children}</SmoothScroll>
          <CustomCursor />
          <CookieConsent />
        </LanguageProvider>
      </body>
    </html>
  );
}
