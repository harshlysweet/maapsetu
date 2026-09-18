"use client";

import Link from "next/link";
import { LoginForm, RegisterForm } from "@/components/forms";
import { PublicFooter, PublicHeader, PageBanner } from "@/components/public";
import { useI18n } from "@/components/i18n-provider";

export function LoginView() {
  const { t } = useI18n();
  return (
    <div>
      <PublicHeader />
      <PageBanner titleKey="login.title" crumbsKey="login.crumbs" />
      <main id="main-content" className="gov-wrap max-w-xl py-10">
        <p className="text-sm text-[var(--muted)] mb-6">{t("login.intro")}</p>
        <div className="card p-6">
          <LoginForm />
        </div>
        <p className="text-sm mt-4">
          {t("login.newUser")}{" "}
          <Link href="/register" className="text-[var(--navy)] font-semibold underline">
            {t("login.register")}
          </Link>
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}

export function RegisterView() {
  const { t } = useI18n();
  return (
    <div>
      <PublicHeader />
      <PageBanner titleKey="register.title" crumbsKey="register.crumbs" />
      <main id="main-content" className="gov-wrap max-w-3xl py-10">
        <p className="text-sm text-[var(--muted)] mb-6">{t("register.intro")}</p>
        <div className="card p-6">
          <RegisterForm />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
