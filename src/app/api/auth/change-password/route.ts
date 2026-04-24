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
    };

    if (!payload.staffId) {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New passwords do not match." },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.findUnique({
      where: { id: payload.staffId },
    });

    if (!staff) {
        return NextResponse.json(
          { error: "User not found." },
          { status: 404 }
        );
      }
      
      if (staff.passwordHash) {
        const valid = await bcrypt.compare(currentPassword, staff.passwordHash);
      
        if (!valid) {
          return NextResponse.json(
            { error: "Current password is incorrect." },
            { status: 401 }
          );
        }
      }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.staff.update({
      where: { id: staff.id },
      data: {
        passwordHash: newHash,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return NextResponse.json(
      { error: "Failed to change password." },
      { status: 500 }
    );
  }
}