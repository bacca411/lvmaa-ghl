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

    const data: any = {};

    if (body.firstName !== undefined) data.firstName = body.firstName;
    if (body.lastName !== undefined) data.lastName = body.lastName;
    if (body.phone !== undefined) data.phone = body.phone || null;
    if (body.email !== undefined) data.email = body.email || null;
    if (body.beltRank !== undefined) data.beltRank = body.beltRank || null;
    if (body.program !== undefined) data.program = body.program || null;
    if (body.status !== undefined) data.status = body.status;

    const student = await prisma.student.update({
      where: { id },
      data,
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