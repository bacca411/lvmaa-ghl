import { NextRequest, NextResponse } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/students",
  "/attendance",
  "/classes",
  "/staff",
  "/clock",
  "/api/students",
  "/api/attendance",
  "/api/classes",
  "/api/staff",
  "/api/clock",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("staff_session");
  const isLoggedIn = Boolean(session?.value);

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtected && !isLoggedIn) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/students/:path*",
    "/attendance/:path*",
    "/classes/:path*",
    "/staff/:path*",
    "/clock/:path*",
    "/api/students/:path*",
    "/api/attendance/:path*",
    "/api/classes/:path*",
    "/api/staff/:path*",
    "/api/clock/:path*",
    "/login",
  ],
};