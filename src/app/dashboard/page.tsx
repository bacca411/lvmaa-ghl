import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendanceCount = await prisma.attendance.count({
    where: {
      checkInTime: {
        gte: today,
      },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Today&apos;s Attendance</h2>
        <p className="mt-2 text-3xl font-bold">{attendanceCount}</p>
      </div>
    </div>
  );
}