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

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        className: body.className,
        program: body.program || null,
        ageGroup: body.ageGroup || null,
        instructorName: body.instructorName || null,
        dayOfWeek: body.dayOfWeek || null,
        startTime: body.startTime || null,
        endTime: body.endTime || null,
        isActive:
          typeof body.isActive === "boolean" ? body.isActive : true,
      },
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("UPDATE CLASS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update class." },
      { status: 500 }
    );
  }
}