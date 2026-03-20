import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function PUT(
  request: Request,
  context: { params: Params }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const student = await prisma.student.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone || null,
        email: body.email || null,
        beltRank: body.beltRank || null,
        program: body.program || null,
        status: body.status || "active",
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("UPDATE STUDENT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update student." },
      { status: 500 }
    );
  }
}