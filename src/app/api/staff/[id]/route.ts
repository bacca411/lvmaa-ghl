import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { firstName, lastName, email, role, pinCode, isActive } = body;

    const updatedStaff = await prisma.staff.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email: email || null,
        role: role || null,
        pinCode: pinCode || null,
        isActive,
      },
    });

    return NextResponse.json(updatedStaff);
  } catch {
    return NextResponse.json(
      { error: "Failed to update staff member" },
      { status: 500 }
    );
  }
}