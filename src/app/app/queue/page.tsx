import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StatusBadge } from "@/components/public";
import { AssignForm, AutoAssignButton } from "@/components/forms";

export default async function QueuePage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/app");

  const [pending, officers] = await Promise.all([
    prisma.application.findMany({
      where: { status: "SUBMITTED" },
      include: { instrument: { include: { owner: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      where: { role: { in: ["LMO", "GATC"] } },
      select: { id: true, name: true, role: true },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl">Assignment queue</h1>
      <div className="mt-4">
        <AutoAssignButton />
      </div>
      <div className="space-y-4 mt-6">
        {pending.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No unassigned applications.</p>
        ) : (
          pending.map((a) => (
            <article key={a.id} className="card p-5 space-y-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{a.applicationNo}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {a.instrument.owner.name} · {a.instrument.category} · {a.instrument.serialNumber}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <AssignForm applicationId={a.id} officers={officers} />
            </article>
          ))
        )}
      </div>
    </div>
  );
}
