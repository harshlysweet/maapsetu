"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Emblem } from "@/components/emblem";
import { MobileNav, UtilityBar } from "@/components/gov-chrome";
import { useI18n } from "@/components/i18n-provider";
import { statusTone } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${statusTone(status)}`}>{status.replaceAll("_", " ")}</span>;
}

export function PublicHeader() {
  const { t } = useI18n();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setIsLoggedIn(true);
          setUserName(data.user.name);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="india-stripe" />
      <UtilityBar />
      <div className="gov-wrap relative flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <Emblem className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
          <span className="min-w-0">
            <span className="block text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              {t("chrome.govIndia")}
            </span>
            <span className="block text-xl sm:text-2xl font-bold text-[var(--navy)] leading-tight">
              {t("home.title")}
            </span>
            <span className="hidden sm:block text-xs text-[var(--muted)]">{t("chrome.portalSubtitle")}</span>
          </span>
        </Link>
        <div className="flex items-center gap-3 shrink-0">
          {isLoggedIn ? (
            <>
              <span className="hidden lg:inline text-sm font-semibold text-[var(--navy)]">
                Welcome, {userName}
              </span>
              <Link href="/app" className="hidden lg:inline btn btn-accent py-2 text-sm">
                {t("chrome.dashboard")}
              </Link>
              <form action="/app" method="POST" className="hidden lg:inline">
                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/";
                  }}
                  className="btn py-2 text-sm border border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden lg:inline text-sm font-semibold text-[var(--navy)]">
                {t("chrome.login")}
              </Link>
              <Link href="/register" className="hidden lg:inline btn btn-accent py-2 text-sm">
                {t("chrome.register")}
              </Link>
            </>
          )}
          <MobileNav />
        </div>
      </div>
      <nav className="hidden lg:block bg-[var(--navy)] text-white text-sm">
        <div className="gov-wrap flex gap-6 py-2.5 font-medium">
          <Link href="/" className="hover:underline">{t("chrome.home")}</Link>
          <Link href="/verify" className="hover:underline">{t("chrome.kyc")}</Link>
          {isLoggedIn ? (
            <Link href="/app" className="hover:underline">{t("chrome.dashboard")}</Link>
          ) : (
            <>
              <Link href="/login" className="hover:underline">{t("chrome.stakeholderLogin")}</Link>
              <Link href="/register" className="hover:underline">{t("chrome.newRegistration")}</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export function PageBanner({
  titleKey,
  crumbsKey,
}: {
  titleKey: string;
  crumbsKey: string;
}) {
  const { t } = useI18n();
  return (
    <div className="page-banner">
      <div className="gov-wrap">
        <p className="crumb">{t(crumbsKey)}</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold">{t(titleKey)}</h1>
      </div>
    </div>
  );
}

export function PublicFooter() {
  const { t } = useI18n();
  return (
    <footer className="site-footer mt-0">
      <div className="india-stripe" />
      <div className="gov-wrap grid gap-8 py-10 sm:grid-cols-3 text-sm">
        <div>
          <div className="flex items-center gap-2">
            <Emblem className="h-10 w-10" />
            <p className="font-bold text-white">{t("home.title")}</p>
          </div>
          <p className="mt-3 max-w-sm">{t("footer.about")}</p>
        </div>
        <div>
          <p className="font-bold text-white mb-2">{t("footer.quickLinks")}</p>
          <ul className="space-y-1">
            <li>
              <Link href="/verify" className="hover:underline">
                {t("chrome.kyc")}
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:underline">
                {t("footer.officerGatc")}
              </Link>
            </li>
            <li>
              <a href="https://emaap.gov.in/" className="hover:underline" target="_blank" rel="noreferrer">
                {t("footer.emaap")}
              </a>
            </li>
            <li>
              <a href="https://consumeraffairs.nic.in/" className="hover:underline" target="_blank" rel="noreferrer">
                {t("footer.doca")}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-bold text-white mb-2">{t("footer.helpdesk")}</p>
          <p>{t("footer.helpdeskPhone")}</p>
          <p className="mt-2">{t("footer.disclaimer")}</p>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="gov-wrap py-3 text-xs text-white/70">{t("footer.owned")}</p>
      </div>
    </footer>
  );
}
