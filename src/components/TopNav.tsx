"use client";

export default function TopNav() {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="flex items-center justify-between bg-white shadow px-6 py-4">
      <h1 className="text-lg font-bold">LVMAA</h1>

      <nav className="flex items-center gap-4">
        <a href="/dashboard">Dashboard</a>
        <a href="/students">Students</a>
        <a href="/classes">Classes</a>

        {/* 🔥 Logout button */}
        <button
          onClick={handleLogout}
          className="ml-4 px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}