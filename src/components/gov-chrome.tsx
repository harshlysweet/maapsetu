"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Menu } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

/** Topmost GOI green strip — mirrors mygov.in */
export function GovTopBanner() {
  return (
    <div className="goi-top-banner">
      <div className="gov-wrap flex items-center gap-2 py-1 text-[11px] font-semibold tracking-wide">
        <span className="text-base leading-none">🇮🇳</span>
        <span>GOVERNMENT OF INDIA</span>
        <span className="ml-auto hidden sm:inline opacity-80">
          <a href="#main-content" className="hover:underline">Skip to main content</a>
        </span>
      </div>
    </div>
  );
}

/** Scrolling news ticker strip */
export function MarqueeTicker() {
  const items = [
    "MaapSetu is now live across Telangana — Apply for instrument verification online",
    "New: QR-based certificate verification available for consumers",
    "LMO officers: Use the field app to submit inspection reports digitally",
    "Helpdesk: 1800-XXX-XXXX (Toll Free) | Mon–Sat 9:00 AM – 6:00 PM",
  ];
  return (
    <div className="marquee-bar">
      <span className="marquee-label">📢 Latest</span>
      <div className="marquee-track">
        <span className="marquee-content">
          {[...items, ...items].map((item, i) => (
            <span key={i} className="marquee-item">{item}</span>
          ))}
        </span>
      </div>
    </div>
  );
}

export function UtilityBar() {
  const { lang, setLang, t } = useI18n();
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [today, setToday] = useState("");

  useEffect(() => {
    document.documentElement.dataset.font = size;
  }, [size]);

  useEffect(() => {
    setToday(new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN"));
  }, [lang]);

  return (
    <div className="utility-bar">
      <div className="gov-wrap flex items-center justify-between gap-3 py-1.5 text-[11px]">
        {/* Skip / Ministry text on LEFT — truncates gracefully */}
        <div className="flex items-center gap-3 min-w-0">
          <a href="#main-content" className="underline-offset-2 hover:underline shrink-0">
            {t("chrome.skip")}
          </a>
          <span className="hidden sm:inline text-white/50">|</span>
          <span className="hidden md:inline truncate">{t("chrome.ministry")}</span>
        </div>
        {/* Controls pinned RIGHT — shrink-0 so they never move regardless of text size */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="hidden sm:inline text-white/70" suppressHydrationWarning>{today}</span>
          <CalendarDays size={13} className="hidden sm:block opacity-80" />
          <span className="text-white/50">|</span>
          <button type="button" onClick={() => setSize("sm")} className="hover:underline" aria-label={t("chrome.decreaseText")} suppressHydrationWarning>
            A-
          </button>
          <button type="button" onClick={() => setSize("md")} className="hover:underline font-semibold" aria-label={t("chrome.defaultText")} suppressHydrationWarning>
            A
          </button>
          <button type="button" onClick={() => setSize("lg")} className="text-sm hover:underline" aria-label={t("chrome.increaseText")} suppressHydrationWarning>
            A+
          </button>
          <span className="text-white/50">|</span>
          <button
            type="button"
            onClick={() => setLang(lang === "hi" ? "en" : "hi")}
            className="hover:underline font-medium"
            aria-pressed={lang === "hi"}
            suppressHydrationWarning
          >
            {lang === "hi" ? t("chrome.english") : t("chrome.hindi")}
          </button>
          <span className="text-base leading-none" aria-label="India">🇮🇳</span>
        </div>
      </div>
    </div>
  );
}

function TricolourMini() {
  return (
    <svg viewBox="0 0 36 24" className="h-3.5 w-6" aria-hidden>
      <rect width="36" height="8" fill="#FF9933" />
      <rect y="8" width="36" height="8" fill="#fff" />
      <rect y="16" width="36" height="8" fill="#138808" />
    </svg>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(!!data.user);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="lg:hidden">
      <button type="button" className="p-2 text-[var(--navy)]" onClick={() => setOpen((v) => !v)} aria-label={t("chrome.menu")}>
        <Menu size={22} />
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-full border-b bg-white shadow-md">
          <nav className="gov-wrap py-3 grid gap-2 text-sm">
            <Link href="/verify" onClick={() => setOpen(false)}>
              {t("chrome.kyc")}
            </Link>
            {isLoggedIn ? (
              <Link href="/app" onClick={() => setOpen(false)}>
                {t("chrome.dashboard")}
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  {t("chrome.officerUserLogin")}
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  {t("chrome.newRegistration")}
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
