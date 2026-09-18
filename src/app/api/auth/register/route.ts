import { NextResponse } from "next/server";
import { registerTrader } from "@/lib/auth-credentials";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const result = await registerTrader(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
