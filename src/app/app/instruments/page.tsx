import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/public";
import { ApplyButton, DeleteCertificateButton } from "@/components/forms";
import { daysUntil, formatDate } from "@/lib/utils";
import { certificatePath } from "@/lib/public-url";
import { cached } from "@/lib/cache";

export const revalidate = 15;
export default async function InstrumentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "TRADER") redirect("/app");

  const instruments = await cached(`instr:${session.id}`, 15_000, () =>
    prisma.instrument.findMany({
      where: { ownerId: session.id },
      select: {
        id: true,
        make: true,
        model: true,
        serialNumber: true,
        category: true,
        accuracyClass: true,
        capacity: true,
        premisesName: true,
        validUntil: true,
        status: true,
        applications: {
          where: { status: { in: ["SUBMITTED", "ASSIGNED", "SCHEDULED"] } },
          select: { id: true },
        },
        certificates: {
          orderBy: { issuedAt: "desc" },
          take: 1,
          select: { certificateNo: true, id: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
  );

  return (
    <div>
      <div className="flex justify-between items-center gap-3">
        <h1 className="font-display text-3xl">Instruments</h1>
        <Link href="/app/instruments/new" className="btn btn-primary">
          Register instrument
        </Link>
      </div>
      <div className="space-y-3 mt-6">
        {instruments.map((i) => {
          const open = i.applications.length > 0;
          const type = i.status === "UNVERIFIED" ? "FIRST" : "REVERIFICATION";
          return (
            <article key={i.id} className="card p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {i.make} {i.model} · {i.serialNumber}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {i.category} class {i.accuracyClass} · {i.capacity}
                  </p>
                  <p className="text-sm">{i.premisesName}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Valid until {formatDate(i.validUntil)}
                    {daysUntil(i.validUntil) !== null ? ` (${daysUntil(i.validUntil)} days)` : ""}
                  </p>
                </div>
                <StatusBadge status={i.status} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {!open ? <ApplyButton instrumentId={i.id} type={type} /> : <StatusBadge status="SUBMITTED" />}
                {i.certificates[0] ? (
                  <>
                    <Link
                      href={certificatePath(i.certificates[0].certificateNo)}
                      className="btn btn-ghost py-2 text-sm"
                    >
                      View certificate
                    </Link>
                    <DeleteCertificateButton certificateId={i.certificates[0].id} />
                  </>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
