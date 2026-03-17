"use client";

import { useEffect, useState } from "react";

type Staff = {
  id: string;
  firstName: string;
  lastName: string;
};

type Shift = {
  id: string;
  clockInTime: string;
  staff: Staff;
};

export default function ClockInPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [openShifts, setOpenShifts] = useState<Shift[]>([]);
  const [message, setMessage] = useState("");

  async function loadStaff() {
    const res = await fetch("/api/staff");
    const data = await res.json();
    setStaffList(data);
  }

  async function loadOpenShifts() {
    const res = await fetch("/api/clock");
    const data = await res.json();
    setOpenShifts(data);
  }

  async function handleAction(action: "clock_in" | "clock_out") {
    setMessage("");

    if (!selectedStaff) {
      setMessage("Select a staff member first.");
      return;
    }

    const res = await fetch("/api/clock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ staffId: selectedStaff, action }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Action failed");
      return;
    }

    setMessage(action === "clock_in" ? "Clocked in." : "Clocked out.");
    loadOpenShifts();
  }

  useEffect(() => {
    loadStaff();
    loadOpenShifts();
  }, []);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Staff Clock-In</h1>

        <div className="mt-6 rounded-2xl border p-6">
          <select
            className="w-full rounded-xl border p-3"
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
          >
            <option value="">Select staff member</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.firstName} {staff.lastName}
              </option>
            ))}
          </select>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => handleAction("clock_in")}
              className="rounded-xl border px-5 py-3 font-semibold"
            >
              Clock In
            </button>
            <button
              onClick={() => handleAction("clock_out")}
              className="rounded-xl border px-5 py-3 font-semibold"
            >
              Clock Out
            </button>
          </div>

          {message && <p className="mt-3 text-sm">{message}</p>}
        </div>

        <div className="mt-8 rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Currently Clocked In</h2>
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
              <p className="text-sm text-gray-500">No staff currently clocked in.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}