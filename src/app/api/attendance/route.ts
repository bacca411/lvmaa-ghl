import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const records = await prisma.attendance.findMany({
    where: {
      checkInTime: {
        gte: today,
      },
    },
    include: {
      student: true,
      class: true,
    },
    orderBy: {
      checkInTime: "desc",
    },
  });

  return NextResponse.json(records);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, classId, notes, createdByStaffId } = body;

    if (!studentId || !classId) {
      return NextResponse.json(
        { error: "studentId and classId are required" },
        { status: 400 }
      );
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId,
        classId,
        checkInTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        student: true,
        class: true,
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          error: "Student is already checked into this class today.",
        },
        { status: 409 }
      );
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        classId,
        notes: notes || null,
        createdByStaffId: createdByStaffId || null,
      },
      include: {
        student: true,
        class: true,
      },
    });

    await prisma.student.update({
      where: { id: studentId },
      data: {
        lastAttended: attendance.checkInTime,
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error("ATTENDANCE POST ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create attendance record" },
      { status: 500 }
    );
  }
}