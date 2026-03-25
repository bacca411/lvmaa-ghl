import { prisma } from "@/lib/prisma";
// CHANGED: removed old direct GHL import
// import { syncStudentToGhl } from "@/lib/ghl";

import { NextResponse } from "next/server";
import { syncStudentById } from "@/lib/student-sync"; // CHANGED: use centralized sync helper

async function getNextStudentNumber() {
  const students = await prisma.student.findMany({
    where: {
      studentNumber: {
        not: null,
      },
    },
    select: {
      studentNumber: true,
    },
  });

  let maxNumber = 1000;

  for (const student of students) {
    const rawValue = student.studentNumber?.replace("LV-", "") ?? "";
    const parsedValue = Number(rawValue);

    if (!Number.isNaN(parsedValue) && parsedValue > maxNumber) {
      maxNumber = parsedValue;
    }
  }

  return `LV-${maxNumber + 1}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const includeArchived = searchParams.get("includeArchived") === "true";

  const students = await prisma.student.findMany({
    where: {
      AND: [
        includeArchived ? {} : { status: { not: "archived" } },
        q
          ? {
              OR: [
                { firstName: { contains: q, mode: "insensitive" } },
                { lastName: { contains: q, mode: "insensitive" } },
                { phone: { contains: q } },
                { email: { contains: q, mode: "insensitive" } },
                { studentNumber: { contains: q, mode: "insensitive" } },
                { program: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return NextResponse.json(students);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      beltRank,
      program,
      status,
      ghlContactId,
    } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First name and last name are required." },
        { status: 400 }
      );
    }

    const studentNumber = await getNextStudentNumber();

    const student = await prisma.student.create({
      data: {
        studentNumber,
        firstName,
        lastName,
        phone: phone || null,
        email: email || null,
        beltRank: beltRank || null,
        program: program || null,
        status: status || "active",
        ghlContactId: ghlContactId || null,
      },
    });

    try {
      // CHANGED: use centralized sync helper instead of calling GHL directly
      const syncedStudent = await syncStudentById(student.id);

      return NextResponse.json(syncedStudent, { status: 201 });
    } catch (ghlError) {
      console.error("GHL CREATE/UPDATE ERROR:", ghlError);

      // CHANGED: re-fetch latest DB state (sync helper may have updated fields)
      const fallbackStudent = await prisma.student.findUnique({
        where: { id: student.id },
      });

      return NextResponse.json(fallbackStudent ?? student, { status: 201 });
    }
  } catch (error) {
    console.error("CREATE STUDENT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create student." },
      { status: 500 }
    );
  }
}