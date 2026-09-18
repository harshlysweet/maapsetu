import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { invalidateCache } from "@/lib/cache";

const schema = z.object({
  officerId: z.string(),
  scheduledAt: z.string(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Only administrators can assign work" }, { status: 403 });
  }

  const { id } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Officer and schedule are required" }, { status: 400 });
  }

  const officer = await prisma.user.findUnique({ where: { id: parsed.data.officerId } });
  if (!officer || (officer.role !== "LMO" && officer.role !== "GATC")) {
    return NextResponse.json({ error: "Select a Legal Metrology Officer or GATC" }, { status: 400 });
  }

  const application = await prisma.application.update({
    where: { id },
    data: {
      assignedToId: officer.id,
      assignedKind: officer.role,
      scheduledAt: new Date(parsed.data.scheduledAt),
      status: "ASSIGNED",
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.id,
      action: "ASSIGNED",
      entity: "Application",
      entityId: application.id,
      detail: `Assigned to ${officer.name} (${officer.role})`,
    },
  });

  invalidateCache("apps:");
  invalidateCache("admin-dash");
  invalidateCache("officer:");
  invalidateCache("home-stats");

  return NextResponse.json({ application });
}
