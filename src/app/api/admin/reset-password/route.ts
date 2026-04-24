import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const authSecret = process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error("AUTH_SECRET is not set");
}

const secret = new TextEncoder().encode(authSecret);

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("lvmaa_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const verified = await jwtVerify(token, secret);
    const payload = verified.payload as {
      staffId?: string;
      role?: string;
    };

    if (!payload.staffId || payload.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { staffId, newPassword } = body;

    if (!staffId || !newPassword) {
      return NextResponse.json(
        { error: "staffId and newPassword are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(newPassword, 10);

    const updated = await prisma.staff.update({
      where: { id: staffId },
      data: {
        passwordHash: hash,
      },
    });

    return NextResponse.json({
      success: true,
      email: updated.email,
    });
  } catch (err) {
    console.error("ADMIN RESET PASSWORD ERROR:", err);

    return NextResponse.json(
      { error: "Failed to reset password." },
      { status: 500 }
    );
  }
}