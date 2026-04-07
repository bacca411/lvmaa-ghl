import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const pinCode = String(body.pinCode || "").trim();

    if (!email || !pinCode) {
      return NextResponse.json(
        { error: "Email and PIN are required" },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.findFirst({
      where: {
        email,
        isActive: true,
      },
    });

    if (!staff || !staff.pinCode) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (staff.pinCode !== pinCode) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();

    cookieStore.set(
      "staff_session",
      JSON.stringify({
        staffId: staff.id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8,
      }
    );

    return NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: staff.role,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);

    return NextResponse.json(
      {
        error: "Login failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}