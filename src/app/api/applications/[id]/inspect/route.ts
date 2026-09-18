import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { catalogueFor } from "@/lib/constants";
import { issueCertificate } from "@/lib/certificates";
import { invalidateCache } from "@/lib/cache";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || (session.role !== "LMO" && session.role !== "GATC")) {
    return NextResponse.json({ error: "Only field officers can record inspections" }, { status: 403 });
  }

  const { id } = await context.params;
  const application = await prisma.application.findUnique({
    where: { id },
    include: { instrument: true, inspection: true },
  });

  if (!application || application.assignedToId !== session.id) {
    return NextResponse.json({ error: "This job is not assigned to you" }, { status: 404 });
  }
  if (application.inspection) {
    return NextResponse.json({ error: "Inspection already recorded" }, { status: 409 });
  }

  const form = await request.formData();
  const result = String(form.get("result") || "");
  const observedError = String(form.get("observedError") || "");
  const notes = String(form.get("notes") || "");
  const standardUsed = String(form.get("standardUsed") || "");
  const lat = Number(form.get("lat") || application.instrument.lat);
  const lng = Number(form.get("lng") || application.instrument.lng);
  const photo = form.get("photo");

  if (result !== "PASS" && result !== "FAIL") {
    return NextResponse.json({ error: "Result must be PASS or FAIL" }, { status: 400 });
  }

  let photoPath: string | undefined;
  if (photo instanceof File && photo.size > 0) {
    const bytes = Buffer.from(await photo.arrayBuffer());
    const uploads = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploads, { recursive: true });
    const filename = `${application.id}-${Date.now()}${path.extname(photo.name) || ".jpg"}`;
    await writeFile(path.join(uploads, filename), bytes);
    photoPath = `/uploads/${filename}`;
  }

  const catalogue = catalogueFor(application.instrument.category);

  await prisma.inspection.create({
    data: {
      applicationId: application.id,
      officerId: session.id,
      result,
      standardUsed: standardUsed || "Department working standard",
      maxPermissibleError: catalogue?.mpe || "As per LM (General) Rules, 2011",
      observedError,
      notes,
      photoPath,
      lat,
      lng,
    },
  });

  if (result === "FAIL") {
    await prisma.application.update({
      where: { id: application.id },
      data: {
        status: "FAILED",
        remarks: "Exceeds maximum permissible error. Withdrawn from trade use until repaired.",
      },
    });
    await prisma.instrument.update({
      where: { id: application.instrumentId },
      data: { status: "FAILED" },
    });
  } else {
    await prisma.application.update({
      where: { id: application.id },
      data: { status: "PASSED" },
    });
    await issueCertificate(application.id);
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.id,
      action: "INSPECTION_RECORDED",
      entity: "Application",
      entityId: application.id,
      detail: `${result} at ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    },
  });

  invalidateCache(); // bust everything — status, certificates, stats all changed

  return NextResponse.json({ ok: true, result });
}
