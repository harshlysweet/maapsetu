import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC = [
  "/",
  "/login",
  "/register",
  "/verify",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApp = pathname.startsWith("/app");
  if (!isApp) {
    if (PUBLIC.some((p) => pathname === p || pathname.startsWith("/verify/"))) {
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("maapsetu_token")?.value;
  if (!token) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret"));
    return NextResponse.next();
  } catch {
    const login = new URL("/login", request.url);
    return NextResponse.redirect(login);
  }
}

export const config = {
  matcher: ["/app", "/app/:path*"],
};
