import { prisma } from "@/lib/prisma";
import { syncStudentToGhl } from "@/lib/ghl";
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

    try {
      await syncStudentToGhl({
        ghlContactId: student.ghlContactId,
        firstName: student.firstName,
        lastName: student.lastName,
        phone: student.phone,
        email: student.email,
        studentNumber: student.studentNumber,
        program: student.program,
        status: student.status,
        beltRank: student.beltRank,
        lastAttended: student.lastAttended,
      });
    } catch (ghlError) {
      console.error("GHL UPDATE ERROR:", ghlError);
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("UPDATE STUDENT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update student." },
      { status: 500 }
    );
  }
}