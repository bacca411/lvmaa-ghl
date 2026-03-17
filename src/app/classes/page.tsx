"use client";

import { useEffect, useState } from "react";

type ClassItem = {
  id: string;
  className: string;
  program?: string | null;
  ageGroup?: string | null;
  instructorName?: string | null;
  dayOfWeek?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isActive: boolean;
};

const emptyForm = {
  className: "",
  program: "",
  ageGroup: "",
  instructorName: "",
  dayOfWeek: "",
  startTime: "",
  endTime: "",
  isActive: true,
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadClasses(search = "") {
    const res = await fetch(`/api/classes?q=${encodeURIComponent(search)}`);
    const data = await res.json();
    setClasses(data);
  }

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClasses(query);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  function resetForm() {
    setEditingId("");
    setForm(emptyForm);
  }

  function startEdit(cls: ClassItem) {
    setEditingId(cls.id);
    setForm({
      className: cls.className || "",
      program: cls.program || "",
      ageGroup: cls.ageGroup || "",
      instructorName: cls.instructorName || "",
      dayOfWeek: cls.dayOfWeek || "",
      startTime: cls.startTime || "",
      endTime: cls.endTime || "",
      isActive: cls.isActive,
    });
    setMessage("");
    setError("");
  }

  async function handleSubmit() {
    setMessage("");
    setError("");

    const url = editingId ? `/api/classes/${editingId}` : "/api/classes";
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

    setMessage(editingId ? "Class updated." : "Class created.");
    resetForm();
    loadClasses(query);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Classes</h1>

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Class" : "Add Class"}
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            className="rounded-xl border p-3"
            placeholder="Class name"
            value={form.className}
            onChange={(e) => setForm({ ...form, className: e.target.value })}
          />
          <input
            className="rounded-xl border p-3"
            placeholder="Program"
            value={form.program}
            onChange={(e) => setForm({ ...form, program: e.target.value })}
          />
          <input
            className="rounded-xl border p-3"
            placeholder="Age group"
            value={form.ageGroup}
            onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
          />
          <input
            className="rounded-xl border p-3"
            placeholder="Instructor name"
            value={form.instructorName}
            onChange={(e) =>
              setForm({ ...form, instructorName: e.target.value })
            }
          />
          <input
            className="rounded-xl border p-3"
            placeholder="Day of week"
            value={form.dayOfWeek}
            onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
          />
          <input
            className="rounded-xl border p-3"
            placeholder="Start time (example 17:00)"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
          <input
            className="rounded-xl border p-3"
            placeholder="End time (example 17:45)"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />
          <select
            className="rounded-xl border p-3"
            value={form.isActive ? "true" : "false"}
            onChange={(e) =>
              setForm({ ...form, isActive: e.target.value === "true" })
            }
          >
            <option value="true">active</option>
            <option value="false">inactive</option>
          </select>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleSubmit}
            className="rounded-xl border px-5 py-3 font-semibold"
          >
            {editingId ? "Save Changes" : "Add Class"}
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
          <h2 className="text-lg font-semibold">Class List</h2>
          <input
            className="w-full max-w-sm rounded-xl border p-3"
            placeholder="Search classes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="mt-4 space-y-3">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium">
                  {cls.className}
                  {cls.dayOfWeek ? ` · ${cls.dayOfWeek}` : ""}
                </p>
                <p className="text-sm text-gray-600">
                  {cls.program || "No program"} · {cls.ageGroup || "No age group"}
                </p>
                <p className="text-sm text-gray-500">
                  {cls.instructorName || "No instructor"}
                  {cls.startTime ? ` · ${cls.startTime}` : ""}
                  {cls.endTime ? ` - ${cls.endTime}` : ""}
                  {` · ${cls.isActive ? "active" : "inactive"}`}
                </p>
              </div>

              <button
                onClick={() => startEdit(cls)}
                className="rounded-lg border px-4 py-2"
              >
                Edit
              </button>
            </div>
          ))}

          {classes.length === 0 && (
            <p className="text-sm text-gray-500">No classes found.</p>
          )}
        </div>
      </div>
    </div>
  );
}