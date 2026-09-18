"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  QrCode,
  Smartphone,
  ShieldCheck,
  Bell,
  MapPin,
  FileCheck,
  Scale,
  Landmark,
  BadgeCheck,
  Users,
} from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/public";
import { VerifySearch } from "@/components/verify-search";
import { useI18n } from "@/components/i18n-provider";

const emptyStats = { instruments: 0, certificates: 0, pending: 0, officers: 0 };

export function HomeView() {
  const { t } = useI18n();
  const [{ instruments, certificates, pending, officers }, setStats] = useState(emptyStats);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/home-stats")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStats({ ...emptyStats, ...data });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  const services = [
    { href: "/verify", icon: QrCode, title: t("home.svcKycTitle"), body: t("home.svcKycBody") },
    { href: "/register", icon: FileCheck, title: t("home.svcApplyTitle"), body: t("home.svcApplyBody") },
    { href: "/login", icon: Smartphone, title: t("home.svcFieldTitle"), body: t("home.svcFieldBody") },
    { href: "/login", icon: Landmark, title: t("home.svcGatcTitle"), body: t("home.svcGatcBody") },
    { href: "/login", icon: MapPin, title: t("home.svcControllerTitle"), body: t("home.svcControllerBody") },
    { href: "/login", icon: ShieldCheck, title: t("home.svcStampTitle"), body: t("home.svcStampBody") },
  ];

  return (
    <div>
      <PublicHeader />
      <main id="main-content">
        <section className="hero-gov">
          <div className="gov-wrap py-16 sm:py-20 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--saffron)] font-semibold">
              {t("home.kicker")}
            </p>
            <h1 className="mt-3 text-3xl sm:text-5xl font-bold leading-tight">{t("home.title")}</h1>
            <p className="mt-2 text-lg text-white/85">{t("home.tagline")}</p>
            <p className="mx-auto mt-4 max-w-2xl text-white/75">{t("home.intro")}</p>
            <div className="mx-auto mt-8 flex justify-center">
              <VerifySearch variant="hero" />
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link href="/verify" className="chip">
                {t("home.verifyScale")}
              </Link>
              <Link href="/login" className="chip">
                {t("home.officerLogin")}
              </Link>
              <Link href="/register" className="chip">
                {t("home.applyVerification")}
              </Link>
              <Link href="/login" className="chip">
                {t("home.gatcLogin")}
              </Link>
              <Link href="/verify" className="chip">
                {t("chrome.kyc")}
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="gov-wrap flex flex-col sm:flex-row items-center gap-5 py-8">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-[var(--navy)] text-white text-2xl font-bold">
              DoCA
            </div>
            <blockquote className="card flex-1 p-5 shadow-sm">
              <p>{t("home.quote")}</p>
              <footer className="mt-3 text-sm text-[var(--muted)]">{t("home.quoteBy")}</footer>
            </blockquote>
          </div>
        </section>

        <section className="stat-bar">
          <div className="gov-wrap grid grid-cols-2 lg:grid-cols-4 gap-6 py-8 text-center">
            <Stat icon={Scale} value={instruments} label={t("home.statInstruments")} />
            <Stat icon={BadgeCheck} value={certificates} label={t("home.statCertificates")} />
            <Stat icon={Bell} value={pending} label={t("home.statPending")} />
            <Stat icon={Users} value={officers} label={t("home.statOfficers")} />
          </div>
        </section>

        <section className="py-12">
          <div className="gov-wrap">
            <h2 className="text-2xl font-bold text-[var(--navy)]">{t("home.servicesTitle")}</h2>
            <p className="text-sm text-[var(--muted)] mt-1">{t("home.servicesSubtitle")}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <Link key={s.title} href={s.href} className="card p-5 hover:border-[var(--navy)]">
                  <s.icon className="text-[var(--goi-red)]" size={28} />
                  <h3 className="mt-3 font-bold text-[var(--navy)]">{s.title}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{s.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-14">
          <div className="gov-wrap grid lg:grid-cols-[0.9fr_1.1fr] gap-0 overflow-hidden rounded-[6px] border">
            <div className="red-panel p-8">
              <h2 className="text-2xl font-bold">{t("home.onlineTitle")}</h2>
              <p className="mt-2 text-white/90">{t("home.onlineBody")}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="border border-white/30 p-3">
                  <p className="text-2xl font-bold">{instruments}</p>
                  <p>{t("home.instruments")}</p>
                </div>
                <div className="border border-white/30 p-3">
                  <p className="text-2xl font-bold">{certificates}</p>
                  <p>{t("home.certificates")}</p>
                </div>
                <div className="border border-white/30 p-3">
                  <p className="text-2xl font-bold">3</p>
                  <p>{t("home.stakeholderRoles")}</p>
                </div>
                <div className="border border-white/30 p-3">
                  <p className="text-2xl font-bold">24×7</p>
                  <p>{t("home.publicVerify")}</p>
                </div>
              </div>
              <Link href="/register" className="mt-6 inline-block border border-white px-4 py-2 font-bold">
                {t("home.viewAll")}
              </Link>
            </div>
            <div className="bg-white p-8">
              <h2 className="text-2xl font-bold text-[var(--navy)]">{t("home.howTitle")}</h2>
              <ol className="mt-4 space-y-3 text-sm">
                <li>
                  <strong>{t("home.how1Label")}</strong>
                  {t("home.how1")}
                </li>
                <li>
                  <strong>{t("home.how2Label")}</strong>
                  {t("home.how2")}
                </li>
                <li>
                  <strong>{t("home.how3Label")}</strong>
                  {t("home.how3")}
                </li>
                <li>
                  <strong>{t("home.how4Label")}</strong>
                  {t("home.how4a")}
                  <code>VC/TS/HYD/2025/00011</code>
                  {t("home.how4b")}
                </li>
              </ol>
              <p className="mt-5 text-xs text-[var(--muted)]">{t("home.complement")}</p>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Scale;
  value: number;
  label: string;
}) {
  return (
    <div>
      <Icon className="mx-auto text-[var(--goi-red)]" size={28} />
      <p className="mt-2 text-3xl font-bold text-[var(--navy)]">{value}</p>
      <p className="text-sm text-[var(--muted)]">{label}</p>
    </div>
  );
}
