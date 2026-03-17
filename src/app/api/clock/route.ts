import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const openShifts = await prisma.staffShift.findMany({
    where: {
      clockOutTime: null,
      status: "clocked_in",
    },
    include: {
      staff: true,
    },
    orderBy: {
      clockInTime: "desc",
    },
  });

  return NextResponse.json(openShifts);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { staffId, action } = body;

    if (!staffId || !action) {
      return NextResponse.json(
        { error: "staffId and action are required" },
        { status: 400 }
      );
    }

    if (action === "clock_in") {
      const existingOpenShift = await prisma.staffShift.findFirst({
        where: {
          staffId,
          clockOutTime: null,
          status: "clocked_in",
        },
      });

      if (existingOpenShift) {
        return NextResponse.json(
          { error: "Staff member is already clocked in." },
          { status: 400 }
        );
      }

      const shift = await prisma.staffShift.create({
        data: {
          staffId,
          status: "clocked_in",
        },
        include: {
          staff: true,
        },
      });

      return NextResponse.json(shift, { status: 201 });
    }

    if (action === "clock_out") {
      const openShift = await prisma.staffShift.findFirst({
        where: {
          staffId,
          clockOutTime: null,
          status: "clocked_in",
        },
        orderBy: {
          clockInTime: "desc",
        },
      });

      if (!openShift) {
        return NextResponse.json(
          { error: "No open shift found." },
          { status: 404 }
        );
      }

      const closedShift = await prisma.staffShift.update({
        where: { id: openShift.id },
        data: {
          clockOutTime: new Date(),
          status: "clocked_out",
        },
        include: {
          staff: true,
        },
      });

      return NextResponse.json(closedShift);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Failed to process clock action" },
      { status: 500 }
    );
  }
}