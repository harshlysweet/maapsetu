"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Scale,
  ClipboardList,
  QrCode,
  LogOut,
  Shield,
  Users,
} from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";
import type { SessionUser } from "@/lib/auth";
import { Emblem } from "@/components/emblem";
import { useI18n } from "@/components/i18n-provider";

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang, setLang } = useI18n();

  const links = {
    TRADER: [
      { href: "/app", label: t("dash.overview"), icon: LayoutDashboard },
      { href: "/app/instruments", label: t("dash.instruments"), icon: Scale },
      { href: "/app/applications", label: t("dash.applications"), icon: ClipboardList },
    ],
    LMO: [
      { href: "/app", label: t("dash.fieldRoster"), icon: LayoutDashboard },
      { href: "/app/applications", label: t("dash.assignedJobs"), icon: ClipboardList },
    ],
    GATC: [
      { href: "/app", label: t("dash.testCentre"), icon: LayoutDashboard },
      { href: "/app/applications", label: t("dash.assignedJobs"), icon: ClipboardList },
    ],
    ADMIN: [
      { href: "/app", label: t("dash.controlRoom"), icon: LayoutDashboard },
      { href: "/app/applications", label: t("dash.allApplications"), icon: ClipboardList },
      { href: "/app/queue", label: t("dash.assignWork"), icon: Shield },
      { href: "/app/users", label: "User Management", icon: Users },
    ],
  };

  const nav = links[user.role];

  async function logout() {
    await logoutAction();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <div className="india-stripe" />
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Emblem className="h-10 w-10 shrink-0" />
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-wider text-[var(--muted)]">
                {t("dash.gov")}
              </span>
              <span className="block font-bold text-[var(--navy)] leading-tight">{t("dash.title")}</span>
            </span>
          </Link>
          <div className="text-right text-xs flex flex-col items-end gap-1">
            <p className="font-semibold">{user.name}</p>
            <p className="text-[var(--muted)]">
              {user.role} · {user.district}
            </p>
          </div>
        </div>
      </header>
      <div className="flex" style={{ minHeight: "calc(100vh - 58px)" }}>
        <aside className="bg-[var(--navy)] text-white px-3 py-4 flex flex-col w-[230px] shrink-0 sticky top-[58px] h-[calc(100vh-58px)] overflow-y-auto">
          <nav className="space-y-1 flex-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 text-sm ${
                    active ? "bg-white/15 font-semibold" : "hover:bg-white/10"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/verify"
              className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              <QrCode size={16} />
              {t("dash.kyc")}
            </Link>
          </nav>
          <button type="button" onClick={logout} className="mt-3 flex items-center gap-2 px-3 py-2 text-xs bg-[var(--goi-red)]">
            <LogOut size={14} /> {t("dash.logout")}
          </button>
        </aside>
        <main id="main-content" className="p-5 lg:p-8 max-w-6xl flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
