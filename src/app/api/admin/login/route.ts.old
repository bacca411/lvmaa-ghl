import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const emailInput = String(body.email || "");
    const password = String(body.password || "");

    const normalizedEmail = emailInput.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.findUnique({
      where: { email: normalizedEmail },
    });

    console.log("LOGIN ATTEMPT", {
      emailSent: emailInput,
      normalizedEmail,
      foundStaff: !!staff,
      hasPasswordHash: !!staff?.passwordHash,
      isActive: staff?.isActive,
      staffEmail: staff?.email,
    });

    if (!staff || !staff.passwordHash || !staff.isActive) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, staff.passwordHash);

    console.log("PASSWORD CHECK", {
      normalizedEmail,
      valid,
    });

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = await new SignJWT({
      staffId: staff.id,
      role: staff.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(secret);

    const res = NextResponse.json({ success: true });

    res.cookies.set("lvmaa_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return res;
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return NextResponse.json(
      { error: "Login failed." },
      { status: 500 }
    );
  }
}