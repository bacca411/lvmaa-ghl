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

  const recentStaffShifts = await prisma.staffShift.findMany({
    include: {
      staff: true,
    },
    orderBy: {
      clockInTime: "desc",
    },
    take: 10,
  });

  type AttendanceRecord = (typeof todayAttendance)[number];
  type StaffShiftRecord = (typeof recentStaffShifts)[number];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h2 className="text-lg font-semibold">Today&apos;s Attendance</h2>
          <p className="mt-2 text-3xl font-bold">{attendanceCount}</p>
        </div>

        <div className="rounded-xl border p-4">
          <h2 className="text-lg font-semibold">Staff Currently Clocked In</h2>
          <p className="mt-2 text-3xl font-bold">{openShifts.length}</p>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="text-xl font-semibold">Recent Attendance</h2>

        <div className="mt-4 space-y-3">
          {todayAttendance.length === 0 ? (
            <p className="text-sm text-gray-500">
              No student attendance recorded today.
            </p>
          ) : (
            todayAttendance.map((record: AttendanceRecord) => (
              <div key={record.id} className="rounded-xl border p-3">
                <p className="font-medium">
                  {record.student.firstName} {record.student.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {record.class.className}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(record.checkInTime).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="text-xl font-semibold">Staff Currently Clocked In</h2>

        <div className="mt-4 space-y-3">
          {openShifts.length === 0 ? (
            <p className="text-sm text-gray-500">
              No staff members are currently clocked in.
            </p>
          ) : (
            openShifts.map((shift) => (
              <div key={shift.id} className="rounded-xl border p-3">
                <p className="font-medium">
                  {shift.staff.firstName} {shift.staff.lastName}
                </p>
                <p className="text-xs text-gray-400">
                  Clocked in at{" "}
                  {new Date(shift.clockInTime).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="text-xl font-semibold">Recent Staff Clock Activity</h2>

        <div className="mt-4 space-y-3">
          {recentStaffShifts.length === 0 ? (
            <p className="text-sm text-gray-500">
              No recent staff clock activity.
            </p>
          ) : (
            recentStaffShifts.map((shift: StaffShiftRecord) => (
              <div key={shift.id} className="rounded-xl border p-3">
                <p className="font-medium">
                  {shift.staff.firstName} {shift.staff.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  In: {new Date(shift.clockInTime).toLocaleTimeString()}
                </p>
                <p className="text-xs text-gray-400">
                  Out:{" "}
                  {shift.clockOutTime
                    ? new Date(shift.clockOutTime).toLocaleTimeString()
                    : "Still clocked in"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}