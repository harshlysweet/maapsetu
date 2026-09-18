import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StatusBadge } from "@/components/public";
import { AssignForm, InspectForm } from "@/components/forms";
import { formatDateTime, rupees } from "@/lib/utils";
import { certificatePath } from "@/lib/public-url";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    select: {
      id: true,
      applicationNo: true,
      type: true,
      status: true,
      feeAmount: true,
      assignedToId: true,
      scheduledAt: true,
      remarks: true,
      instrument: {
        select: {
          make: true,
          model: true,
          serialNumber: true,
          category: true,
          accuracyClass: true,
          premisesName: true,
          address: true,
          lat: true,
          lng: true,
          owner: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
      },
      assignedTo: {
        select: {
          name: true,
          role: true,
        },
      },
      inspection: {
        select: {
          result: true,
          standardUsed: true,
          maxPermissibleError: true,
          observedError: true,
          notes: true,
          photoPath: true,
          lat: true,
          lng: true,
          inspectedAt: true,
          officer: {
            select: {
              name: true,
            },
          },
        },
      },
      certificate: {
        select: {
          certificateNo: true,
        },
      },
    },
  });
  if (!application) notFound();

  const officers = await prisma.user.findMany({
    where: { role: { in: ["LMO", "GATC"] } },
    select: { id: true, name: true, role: true },
    take: 50,
  });

  const canInspect =
    (session.role === "LMO" || session.role === "GATC") &&
    application.assignedToId === session.id &&
    !application.inspection;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Application</p>
        <h1 className="font-display text-3xl">{application.applicationNo}</h1>
        <div className="mt-2">
          <StatusBadge status={application.status} />
        </div>
      </div>

      <section className="card p-5 grid sm:grid-cols-2 gap-4 text-sm">
        <Field label="User" value={application.instrument.owner.name} />
        <Field label="Phone" value={application.instrument.owner.phone} />
        <Field label="Instrument" value={`${application.instrument.make} ${application.instrument.model}`} />
        <Field label="Serial" value={application.instrument.serialNumber} />
        <Field label="Category" value={`${application.instrument.category} class ${application.instrument.accuracyClass}`} />
        <Field label="Fee (demo)" value={rupees(application.feeAmount)} />
        <Field label="Premises" value={application.instrument.premisesName} />
        <Field label="Address" value={application.instrument.address} />
        <Field label="Assigned to" value={application.assignedTo ? `${application.assignedTo.role} · ${application.assignedTo.name}` : "Unassigned"} />
        <Field label="Scheduled" value={formatDateTime(application.scheduledAt)} />
      </section>

      {session.role === "ADMIN" && !application.assignedToId ? (
        <section className="card p-5">
          <h2 className="font-display text-xl mb-3">Assign officer or GATC</h2>
          <AssignForm applicationId={application.id} officers={officers} />
        </section>
      ) : null}

      {canInspect ? (
        <section className="card p-5">
          <h2 className="font-display text-xl mb-3">Record inspection</h2>
          <InspectForm
            applicationId={application.id}
            lat={application.instrument.lat}
            lng={application.instrument.lng}
          />
        </section>
      ) : null}

      {application.inspection ? (
        <section className="card p-5 text-sm space-y-2">
          <h2 className="font-display text-xl">Inspection</h2>
          <p>
            {application.inspection.result} by {application.inspection.officer.name} at{" "}
            {formatDateTime(application.inspection.inspectedAt)}
          </p>
          <p>Standard: {application.inspection.standardUsed}</p>
          <p>
            MPE {application.inspection.maxPermissibleError} · Observed {application.inspection.observedError}
          </p>
          <p>{application.inspection.notes}</p>
          <p className="text-xs text-[var(--muted)]">
            Geo {application.inspection.lat.toFixed(5)}, {application.inspection.lng.toFixed(5)}
          </p>
          {application.inspection.photoPath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={application.inspection.photoPath} alt="Site" className="mt-2 max-h-64 rounded-lg" />
          ) : null}
        </section>
      ) : null}

      {application.certificate ? (
        <section className="card p-5">
          <h2 className="font-display text-xl">Certificate issued</h2>
          <Link
            className="btn btn-primary mt-3"
            href={certificatePath(application.certificate.certificateNo)}
          >
            Open {application.certificate.certificateNo}
          </Link>
        </section>
      ) : null}

      {application.status === "FAILED" ? (
        <section className="rounded-2xl bg-red-50 p-5">
          <h2 className="font-display text-xl">Enforcement note</h2>
          <p className="text-sm mt-2">
            {application.remarks || "Instrument exceeds MPE and must not be used in trade until repaired and re-verified."}
          </p>
        </section>
      ) : null}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[var(--muted)]">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
