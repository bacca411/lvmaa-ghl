import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const classes = await prisma.class.findMany({
    where: q
      ? {
          OR: [
            { className: { contains: q, mode: "insensitive" } },
            { program: { contains: q, mode: "insensitive" } },
            { ageGroup: { contains: q, mode: "insensitive" } },
            { instructorName: { contains: q, mode: "insensitive" } },
            { dayOfWeek: { contains: q, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: [{ className: "asc" }, { dayOfWeek: "asc" }],
  });

  return NextResponse.json(classes);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      className,
      program,
      ageGroup,
      instructorName,
      dayOfWeek,
      startTime,
      endTime,
      isActive,
    } = body;

    if (!className) {
      return NextResponse.json(
        { error: "Class name is required." },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        className,
        program: program || null,
        ageGroup: ageGroup || null,
        instructorName: instructorName || null,
        dayOfWeek: dayOfWeek || null,
        startTime: startTime || null,
        endTime: endTime || null,
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("CREATE CLASS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create class." },
      { status: 500 }
    );
  }
}