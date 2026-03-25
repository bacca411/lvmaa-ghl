import { prisma } from "@/lib/prisma";
// CHANGED: removed old direct GHL import
// import { syncStudentToGhl } from "@/lib/ghl";

import { NextResponse } from "next/server";
import { syncStudentById } from "@/lib/student-sync"; // CHANGED: use centralized sync helper

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
      // CHANGED: use centralized sync helper instead of calling GHL directly
      const syncedStudent = await syncStudentById(student.id);

      return NextResponse.json(syncedStudent);
    } catch (ghlError) {
      console.error("GHL UPDATE ERROR:", ghlError);

      // CHANGED: re-fetch latest DB state in case sync helper updated sync fields
      const fallbackStudent = await prisma.student.findUnique({
        where: { id: student.id },
      });

      return NextResponse.json(fallbackStudent ?? student);
    }
  } catch (error) {
    console.error("UPDATE STUDENT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update student." },
      { status: 500 }
    );
  }
}