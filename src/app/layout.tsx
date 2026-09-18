import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { cookies } from "next/headers";
import { I18nProvider } from "@/components/i18n-provider";
import { LANG_COOKIE, parseLang } from "@/lib/i18n";
import "./globals.css";

const sans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-deva",
  subsets: ["devanagari"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  fallback: ["Nirmala UI", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  title: "MaapSetu | Legal Metrology Verification Portal",
  description:
    "Government-style portal for online verification, stamping and QR certificates of weighing and measuring instruments.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jar = await cookies();
  const initialLang = parseLang(jar.get(LANG_COOKIE)?.value);
  return (
    <html lang={initialLang} className={`${sans.variable} ${devanagari.variable} h-full`}>
      <body className="min-h-full antialiased">
        <I18nProvider initialLang={initialLang}>{children}</I18nProvider>
      </body>
    </html>
  );
}

