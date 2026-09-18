import { NextResponse } from "next/server";
import { loginWithPassword } from "@/lib/auth-credentials";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const result = await loginWithPassword(String(body.email || ""), String(body.password || ""));
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, role: result.role });
}
