"use client";

import { useEffect, useState } from "react";

export default function AttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    const studentsRes = await fetch("/api/students");
    const classesRes = await fetch("/api/classes");
    const attendanceRes = await fetch("/api/attendance");

    const studentsData = await studentsRes.json();
    const classesData = await classesRes.json();
    const attendanceData = await attendanceRes.json();

    setStudents(studentsData);
    setClasses(classesData);
    setAttendance(attendanceData);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCheckIn() {
    setMessage("");
    setError("");

    if (!selectedStudent || !selectedClass) {
      setError("Please select both a student and a class.");
      return;
    }

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId: selectedStudent,
        classId: selectedClass,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Check-in failed.");
      return;
    }

    setMessage("Student checked in successfully.");

    await loadData();
  }

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Attendance</h1>

      {/* STUDENT SELECT */}

      <div>
        <label className="block font-semibold mb-1">Student</label>

        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">Select Student</option>

          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.firstName} {s.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* QUICK STUDENTS */}

      <div>
        <p className="text-sm font-semibold mb-2">Quick Students</p>

        <div className="flex flex-wrap gap-2">
          {students.slice(0, 10).map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student.id)}
              className={`px-3 py-2 rounded border ${
                selectedStudent === student.id
                  ? "bg-blue-600 text-white"
                  : "bg-white"
              }`}
            >
              {student.firstName} {student.lastName}
            </button>
          ))}
        </div>
      </div>

      {/* CLASS SELECT */}

      <div>
        <label className="block font-semibold mb-1">Class</label>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">Select Class</option>

          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.className}
            </option>
          ))}
        </select>
      </div>

      {/* QUICK CLASSES */}

      <div>
        <p className="text-sm font-semibold mb-2">Quick Classes</p>

        <div className="flex flex-wrap gap-2">
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls.id)}
              className={`px-3 py-2 rounded border ${
                selectedClass === cls.id
                  ? "bg-green-600 text-white"
                  : "bg-white"
              }`}
            >
              {cls.className}
            </button>
          ))}
        </div>
      </div>

      {/* CHECK IN BUTTON */}

      <button
        onClick={handleCheckIn}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Check In
      </button>

      {/* MESSAGES */}

      {message && (
        <div className="rounded border bg-green-50 p-3 font-medium">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded border bg-red-50 p-3 font-medium">
          {error}
        </div>
      )}

      {/* REFRESH */}

      <button
        onClick={loadData}
        className="border px-3 py-2 rounded"
      >
        Refresh Attendance
      </button>

      {/* RECENT ATTENDANCE */}

      <div>

        <h2 className="text-xl font-semibold">Recent Check-ins</h2>

        <div className="space-y-2 mt-2">

          {attendance.map((a) => (
            <div
              key={a.id}
              className="border rounded p-2 flex justify-between"
            >
              <span>
                {a.student.firstName} {a.student.lastName}
              </span>

              <span>
                {a.class.className}
              </span>

              <span>
                {new Date(a.checkInTime).toLocaleTimeString()}
              </span>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}