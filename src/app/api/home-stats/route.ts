import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cached } from "@/lib/cache";

const empty = { instruments: 0, certificates: 0, pending: 0, officers: 0 };

export async function GET() {
  try {
    const stats = await cached("home-stats", 30_000, async () => {
      const rows = await prisma.$queryRaw<[{
        instruments: bigint;
        certificates: bigint;
        pending: bigint;
        officers: bigint;
      }]>`
        SELECT
          (SELECT COUNT(*) FROM "Instrument") AS instruments,
          (SELECT COUNT(*) FROM "Certificate") AS certificates,
          (SELECT COUNT(*) FROM "Application" WHERE "status" IN ('SUBMITTED','ASSIGNED')) AS pending,
          (SELECT COUNT(*) FROM "User" WHERE "role" IN ('LMO','GATC')) AS officers
      `;
      const r = rows[0];
      return {
        instruments: Number(r.instruments),
        certificates: Number(r.certificates),
        pending: Number(r.pending),
        officers: Number(r.officers),
      };
    });
    return NextResponse.json(stats);
  } catch (error) {
    console.error("home-stats", error);
    return NextResponse.json(empty, { status: 200 });
  }
}
