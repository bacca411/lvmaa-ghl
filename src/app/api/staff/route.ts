import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: [
        { isActive: "desc" },
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("GET /api/staff failed:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch staff",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, role, pinCode } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    const newStaff = await prisma.staff.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        role: role || null,
        pinCode: pinCode || null,
      },
    });

    return NextResponse.json(newStaff, { status: 201 });
  } catch (error) {
    console.error("POST /api/staff failed:", error);

    return NextResponse.json(
      {
        error: "Failed to create staff member",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}