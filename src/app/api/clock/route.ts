import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/clock?staffId=xxx — returns staff info + current shift status
export async function GET(req: NextRequest) {
  const staffId = req.nextUrl.searchParams.get("staffId");

  if (!staffId) {
    return NextResponse.json({ error: "staffId required" }, { status: 400 });
  }

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
  });

  if (!staff) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  const activeShift = await prisma.staffShift.findFirst({
    where: { staffId, clockOutTime: null },
    orderBy: { clockInTime: "desc" },
  });

  return NextResponse.json({
    id: staff.id,
    name: `${staff.firstName} ${staff.lastName}`,
    currentShiftId: activeShift?.id ?? null,
    clockedInAt: activeShift?.clockInTime?.toISOString() ?? null,
  });
}

// POST /api/clock — clock in or out
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { staffId, action } = body as { staffId: string; action: "in" | "out" };

  if (!staffId || !action) {
    return NextResponse.json({ error: "staffId and action required" }, { status: 400 });
  }

  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  if (action === "in") {
    const existing = await prisma.staffShift.findFirst({
      where: { staffId, clockOutTime: null },
    });
    if (existing) {
      return NextResponse.json({ error: "Already clocked in", shiftId: existing.id }, { status: 409 });
    }

    const shift = await prisma.staffShift.create({
      data: {
        staffId,
        clockInTime: new Date(),
        status: "clocked_in",
      },
    });

    return NextResponse.json({ shiftId: shift.id, clockedInAt: shift.clockInTime.toISOString() });
  }

  if (action === "out") {
    const shift = await prisma.staffShift.findFirst({
      where: { staffId, clockOutTime: null },
      orderBy: { clockInTime: "desc" },
    });

    if (!shift) {
      return NextResponse.json({ error: "Not clocked in" }, { status: 409 });
    }

    const now = new Date();
    const updated = await prisma.staffShift.update({
      where: { id: shift.id },
      data: { clockOutTime: now, status: "clocked_out" },
    });

    const durationMs = now.getTime() - updated.clockInTime.getTime();
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return NextResponse.json({ shiftId: shift.id, duration });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}