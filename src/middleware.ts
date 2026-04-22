import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const authSecret = process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error("AUTH_SECRET is not set");
}

const secret = new TextEncoder().encode(authSecret);

const publicPaths = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const isApiAuth =
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout");

  const isStatic =
    pathname.startsWith("/_next") || pathname === "/favicon.ico";

  if (isApiAuth || isStatic) {
    return NextResponse.next();
  }

  const token = request.cookies.get("lvmaa_session")?.value;

  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, secret);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublic && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};