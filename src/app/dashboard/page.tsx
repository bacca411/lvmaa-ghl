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

  type AttendanceRecord = (typeof todayAttendance)[number];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Today&lsquo;s Attendance</h2>
        <p className="text-3xl font-bold mt-2">{attendanceCount}</p>
      </div>

      <div className="rounded-xl border p-4">
        <h2 className="text-xl font-semibold">Recent Attendance</h2>

        <div className="mt-4 space-y-3">
          {todayAttendance.map((record: AttendanceRecord) => (
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
          ))}
        </div>
      </div>
    </div>
  );
}