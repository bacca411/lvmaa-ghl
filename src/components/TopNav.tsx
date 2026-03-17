import Link from "next/link";

export default function TopNav() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl gap-3 p-4">
        <Link href="/" className="rounded-lg border px-3 py-2 font-medium">
          Home
        </Link>

        <Link href="/attendance" className="rounded-lg border px-3 py-2 font-medium">
          Attendance
        </Link>

        <Link href="/clock" className="rounded-lg border px-3 py-2 font-medium">
          Clock
        </Link>

        <Link href="/dashboard" className="rounded-lg border px-3 py-2 font-medium">
          Dashboard
        </Link>

        <Link href="/students" className="rounded-lg border px-3 py-2 font-medium">
         Students
        </Link>
        <Link href="/classes" className="rounded-lg border px-3 py-2 font-medium">
         Classes
        </Link>
      </div>
    </nav>
  );
}