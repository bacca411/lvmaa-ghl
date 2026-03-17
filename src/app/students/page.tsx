"use client";

import { useEffect, useState } from "react";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  beltRank?: string | null;
  status?: string | null;
};

const emptyForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  beltRank: "",
  status: "active",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadStudents(search = "") {
    const res = await fetch(`/api/students?q=${encodeURIComponent(search)}`);
    const data = await res.json();
    setStudents(data);
  }

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents(query);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  function startEdit(student: Student) {
    setEditingId(student.id);
    setForm({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      phone: student.phone || "",
      email: student.email || "",
      beltRank: student.beltRank || "",
      status: student.status || "active",
    });
    setMessage("");
    setError("");
  }

  function resetForm() {
    setEditingId("");
    setForm(emptyForm);
  }

  async function handleSubmit() {
    setMessage("");
    setError("");

    const url = editingId ? `/api/students/${editingId}` : "/api/students";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Save failed.");
      return;
    }

    setMessage(editingId ? "Student updated." : "Student created.");
    resetForm();
    loadStudents(query);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Students</h1>

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Student" : "Add Student"}
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            className="rounded-xl border p-3"
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
          <input
            className="rounded-xl border p-3"
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
          <input
            className="rounded-xl border p-3"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            className="rounded-xl border p-3"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="rounded-xl border p-3"
            placeholder="Belt rank"
            value={form.beltRank}
            onChange={(e) => setForm({ ...form, beltRank: e.target.value })}
          />
          <select
            className="rounded-xl border p-3"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="trial">trial</option>
          </select>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleSubmit}
            className="rounded-xl border px-5 py-3 font-semibold"
          >
            {editingId ? "Save Changes" : "Add Student"}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="rounded-xl border px-5 py-3"
            >
              Cancel
            </button>
          )}
        </div>

        {message && (
          <div className="mt-4 rounded-lg border bg-green-50 p-3 font-medium">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border bg-red-50 p-3 font-medium">
            {error}
          </div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Student List</h2>
          <input
            className="w-full max-w-sm rounded-xl border p-3"
            placeholder="Search students"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="mt-4 space-y-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {student.beltRank || "No belt rank"} · {student.status || "active"}
                </p>
                <p className="text-sm text-gray-500">
                  {student.phone || "No phone"} {student.email ? `· ${student.email}` : ""}
                </p>
              </div>

              <button
                onClick={() => startEdit(student)}
                className="rounded-lg border px-4 py-2"
              >
                Edit
              </button>
            </div>
          ))}

          {students.length === 0 && (
            <p className="text-sm text-gray-500">No students found.</p>
          )}
        </div>
      </div>
    </div>
  );
}