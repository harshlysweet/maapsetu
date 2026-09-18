import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { catalogueFor } from "@/lib/constants";
import { nextApplicationNo } from "@/lib/certificates";
import { invalidateCache } from "@/lib/cache";

const schema = z.object({
  instrumentId: z.string(),
  type: z.enum(["FIRST", "REVERIFICATION"]),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const where =
    session.role === "TRADER"
      ? { instrument: { ownerId: session.id } }
      : session.role === "ADMIN"
        ? {}
        : { assignedToId: session.id };

  const applications = await prisma.application.findMany({
    where,
    include: {
      instrument: { include: { owner: true } },
      assignedTo: true,
      inspection: true,
      certificate: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "TRADER") {
    return NextResponse.json({ error: "Only instrument users can apply" }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid application" }, { status: 400 });
  }

  const instrument = await prisma.instrument.findFirst({
    where: { id: parsed.data.instrumentId, ownerId: session.id },
  });
  if (!instrument) {
    return NextResponse.json({ error: "Instrument not found" }, { status: 404 });
  }

  const open = await prisma.application.findFirst({
    where: {
      instrumentId: instrument.id,
      status: { in: ["SUBMITTED", "ASSIGNED", "SCHEDULED", "IN_PROGRESS"] },
    },
  });
  if (open) {
    return NextResponse.json({ error: "An application is already in progress for this instrument" }, { status: 409 });
  }

  const catalogue = catalogueFor(instrument.category);
  const application = await prisma.application.create({
    data: {
      applicationNo: await nextApplicationNo(),
      instrumentId: instrument.id,
      type: parsed.data.type,
      status: "SUBMITTED",
      feeAmount: catalogue?.fee ?? 200,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.id,
      action: "APPLICATION_SUBMITTED",
      entity: "Application",
      entityId: application.id,
      detail: `${application.applicationNo} fee ₹${application.feeAmount} (demo payment captured)`,
    },
  });

  invalidateCache("apps:");
  invalidateCache("instr:");
  invalidateCache("home-stats");

  return NextResponse.json({ application });
}
