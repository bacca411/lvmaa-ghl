import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">LVMAA GHL Operations</h1>
        <p className="mt-2 text-gray-600">
          Attendance, staff clock-in, and daily dashboard.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link
            href="/attendance"
            className="rounded-2xl border p-6 shadow-sm hover:shadow"
          >
            <h2 className="text-xl font-semibold">Attendance</h2>
            <p className="mt-2 text-sm text-gray-600">
              Search students and check them into class.
            </p>
          </Link>

          <Link
            href="/clock"
            className="rounded-2xl border p-6 shadow-sm hover:shadow"
          >
            <h2 className="text-xl font-semibold">Staff Clock-In</h2>
            <p className="mt-2 text-sm text-gray-600">
              Clock staff in and out.
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-2xl border p-6 shadow-sm hover:shadow"
          >
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <p className="mt-2 text-sm text-gray-600">
              See today’s attendance and who is on shift.
            </p>
          </Link>
          <Link
          href="/staff"
          className="rounded-2xl border p-6 shadow-sm hover:shadow"
          >
          <h2 className="text-xl font-semibold">Staff</h2>
  <        p className="mt-2 text-sm text-gray-600">
           Add and manage employees.
  </p>
</Link>
        </div>
      </div>
    </main>
  );
}