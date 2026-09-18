import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StatusBadge } from "@/components/public";
import { AutoAssignButton } from "@/components/forms";
import { daysUntil, formatDate, formatDateTime, rupees } from "@/lib/utils";
import { redirect } from "next/navigation";
import { parseLang, translate, type Lang } from "@/lib/i18n";
import { cached } from "@/lib/cache";

export default async function AppHome() {
  const session = await getSession();
  if (!session) redirect("/login");

  const jar = await cookies();
  const lang = parseLang(jar.get("maapsetu_lang")?.value);

  if (session.role === "TRADER") return <TraderHome userId={session.id} name={session.name} lang={lang} />;
  if (session.role === "ADMIN") return <AdminHome lang={lang} />;
  return <OfficerHome userId={session.id} role={session.role} name={session.name} lang={lang} />;
}

async function TraderHome({ userId, name, lang }: { userId: string; name: string; lang: Lang }) {
  const t = (k: string) => translate(lang, k);
  const instruments = await cached(`trader:${userId}`, 15_000, () =>
    prisma.instrument.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        serialNumber: true,
        category: true,
        validUntil: true,
        status: true,
        applications: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { id: true },
        },
      },
      take: 20,
    })
  );
  const expiring = instruments.filter((i) => {
    const d = daysUntil(i.validUntil);
    return d !== null && d <= 30;
  });

  return (
    <div>
      <h1 className="font-display text-3xl">
        {lang === "hi" ? `नमस्ते, ${name}` : `Namaste, ${name}`}
      </h1>
      <p className="text-[var(--muted)] mt-1">{t("dash.traderSubtitle")}</p>
      <div className="grid sm:grid-cols-3 gap-3 mt-6">
        <Stat label={t("dash.statInstruments")} value={instruments.length} />
        <Stat label={t("dash.statDue")} value={expiring.length} warn />
        <Stat label={t("dash.statFailed")} value={instruments.filter((i) => i.status !== "VERIFIED").length} />
      </div>
      <div className="flex justify-between items-center mt-8 mb-3">
        <h2 className="font-display text-2xl">{t("dash.alerts")}</h2>
        <Link href="/app/instruments/new" className="btn btn-primary">
          {t("dash.addInstrument")}
        </Link>
      </div>
      <div className="space-y-2">
        {expiring.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">{t("dash.noAlerts")}</p>
        ) : (
          expiring.map((i) => (
            <div key={i.id} className="card p-4 flex justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {i.serialNumber} · {i.category}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {t("dash.validUntil")} {formatDate(i.validUntil)} ({daysUntil(i.validUntil)} {t("dash.days")})
                </p>
              </div>
              <StatusBadge status="EXPIRING" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

async function AdminHome({ lang }: { lang: Lang }) {
  const t = (k: string) => translate(lang, k);
  const { submitted, assigned, certified, failed, expiring, recent } = await cached("admin-dash", 15_000, async () => {
    const [countsRaw, recent] = await Promise.all([
      prisma.$queryRaw<[{ submitted: bigint; assigned: bigint; certified: bigint; failed: bigint; expiring: bigint }]>`
        SELECT
          COUNT(*) FILTER (WHERE "Application"."status" = 'SUBMITTED') AS submitted,
          COUNT(*) FILTER (WHERE "Application"."status" IN ('ASSIGNED','SCHEDULED','IN_PROGRESS')) AS assigned,
          COUNT(*) FILTER (WHERE "Application"."status" = 'CERTIFIED') AS certified,
          COUNT(*) FILTER (WHERE "Application"."status" = 'FAILED') AS failed,
          (SELECT COUNT(*) FROM "Instrument" WHERE "validUntil" <= NOW() + INTERVAL '30 days') AS expiring
        FROM "Application"
      `,
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          applicationNo: true,
          status: true,
          scheduledAt: true,
          instrument: {
            select: {
              serialNumber: true,
              owner: {
                select: {
                  name: true,
                },
              },
            },
          },
          assignedTo: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);
    const c = countsRaw[0];
    return {
      submitted: Number(c.submitted),
      assigned: Number(c.assigned),
      certified: Number(c.certified),
      failed: Number(c.failed),
      expiring: Number(c.expiring),
      recent,
    };
  });

  return (
    <div>
      <h1 className="font-display text-3xl">{lang === "hi" ? "नियंत्रण कक्ष" : "Control Room"}</h1>
      <p className="text-[var(--muted)] mt-1">{t("dash.adminSubtitle")}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
        <Stat label={t("dash.statUnassigned")} value={submitted} warn />
        <Stat label={t("dash.statInField")} value={assigned} />
        <Stat label={t("dash.statCertified")} value={certified} />
        <Stat label={t("dash.statFailedApp")} value={failed} />
        <Stat label={t("dash.statExpiring")} value={expiring} warn />
      </div>
      <div className="mt-8 card p-5">
        <h2 className="font-display text-xl mb-3">{t("dash.dispatch")}</h2>
        <AutoAssignButton />
        <p className="text-sm text-[var(--muted)] mt-2">{t("dash.dispatchNote")}</p>
      </div>
      <h2 className="font-display text-2xl mt-8 mb-3">{t("dash.recentApps")}</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[var(--muted)]">
            <tr>
              <th className="p-3">{t("dash.colApp")}</th>
              <th>{t("dash.colUser")}</th>
              <th>{t("dash.colInstrument")}</th>
              <th>{t("dash.colStatus")}</th>
              <th>{t("dash.colOfficer")}</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">
                  <Link href={`/app/applications/${a.id}`} className="underline">
                    {a.applicationNo}
                  </Link>
                </td>
                <td>{a.instrument.owner.name}</td>
                <td>{a.instrument.serialNumber}</td>
                <td>
                  <StatusBadge status={a.status} />
                </td>
                <td>{a.assignedTo?.name || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function OfficerHome({
  userId,
  role,
  name,
  lang,
}: {
  userId: string;
  role: string;
  name: string;
  lang: Lang;
}) {
  const t = (k: string) => translate(lang, k);
  const jobs = await cached(`officer:${userId}`, 15_000, () =>
    prisma.application.findMany({
      where: { assignedToId: userId },
      select: {
        id: true,
        status: true,
        feeAmount: true,
        scheduledAt: true,
        instrument: {
          select: {
            premisesName: true,
            category: true,
            serialNumber: true,
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    })
  );
  const open = jobs.filter((j) => ["ASSIGNED", "SCHEDULED", "IN_PROGRESS"].includes(j.status));

  return (
    <div>
      <h1 className="font-display text-3xl">
        {role === "GATC" ? t("dash.testCentreRoster") : t("dash.fieldRosterOf")} — {name}
      </h1>
      <p className="text-[var(--muted)] mt-1">{open.length} {t("dash.openJobs")}.</p>
      <div className="space-y-3 mt-6">
        {jobs.map((job) => (
          <Link key={job.id} href={`/app/applications/${job.id}`} className="card p-4 block hover:border-[var(--navy)]">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold">{job.instrument.premisesName}</p>
                <p className="text-sm text-[var(--muted)]">
                  {job.instrument.category} · {job.instrument.serialNumber} · {rupees(job.feeAmount)}
                </p>
                <p className="text-xs mt-1">{t("dash.scheduled")} {formatDateTime(job.scheduledAt)}</p>
              </div>
              <StatusBadge status={job.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className={`font-display text-3xl mt-1 ${warn ? "text-[var(--saffron)]" : ""}`}>{value}</p>
    </div>
  );
}
