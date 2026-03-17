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

  const todayAttendance = await prisma.attendance.findMany({
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
    take: 10,
  });

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

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <p className="text-sm text-gray-500">Today&apos;s Attendance</p>
            <p className="mt-2 text-3xl font-bold">{attendanceCount}</p>
          </div>

          <div className="rounded-2xl border p-6">
            <p className="text-sm text-gray-500">Staff On Shift</p>
            <p className="mt-2 text-3xl font-bold">{openShifts.length}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Recent Attendance</h2>
            <div className="mt-4 space-y-3">
              {todayAttendance.map((record) => (
                <div key={record.id} className="rounded-xl border p-3">
                  <p className="font-medium">
                    {record.student.firstName} {record.student.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{record.class.className}</p>
                </div>
              ))}
              {todayAttendance.length === 0 && (
                <p className="text-sm text-gray-500">No attendance yet today.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Staff On Shift</h2>
            <div className="mt-4 space-y-3">
              {openShifts.map((shift) => (
                <div key={shift.id} className="rounded-xl border p-3">
                  <p className="font-medium">
                    {shift.staff.firstName} {shift.staff.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Since {new Date(shift.clockInTime).toLocaleString()}
                  </p>
                </div>
              ))}
              {openShifts.length === 0 && (
                <p className="text-sm text-gray-500">Nobody is clocked in.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}