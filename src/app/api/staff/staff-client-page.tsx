"use client";

import { useEffect, useState } from "react";

type StaffMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  role: string | null;
  pinCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type StaffForm = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  pinCode: string;
};

const emptyForm: StaffForm = {
  firstName: "",
  lastName: "",
  email: "",
  role: "",
  pinCode: "",
};

export default function StaffClientPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadStaff() {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/staff", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setStaff([]);
        setErrorMessage(data.error || "Failed to load staff.");
        return;
      }

      if (!Array.isArray(data)) {
        setStaff([]);
        setErrorMessage("Staff response was not in the expected format.");
        return;
      }

      setStaff(data);
    } catch {
      setStaff([]);
      setErrorMessage("Failed to load staff.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStaff();
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function startEdit(staffMember: StaffMember) {
    setEditingId(staffMember.id);
    setForm({
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      email: staffMember.email ?? "",
      role: staffMember.role ?? "",
      pinCode: staffMember.pinCode ?? "",
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      const url = editingId ? `/api/staff/${editingId}` : "/api/staff";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to save staff member.");
        return;
      }

      resetForm();
      await loadStaff();
    } catch {
      setErrorMessage("Failed to save staff member.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(staffMember: StaffMember) {
    setErrorMessage("");

    try {
      const response = await fetch(`/api/staff/${staffMember.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: staffMember.firstName,
          lastName: staffMember.lastName,
          email: staffMember.email ?? "",
          role: staffMember.role ?? "",
          pinCode: staffMember.pinCode ?? "",
          isActive: !staffMember.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to update staff status.");
        return;
      }

      await loadStaff();
    } catch {
      setErrorMessage("Failed to update staff status.");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    window.location.href = "/admin/login";
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Staff</h1>
            <p className="mt-2 text-gray-600">
              Add and manage employees for clock-in and operations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-xl border px-4 py-2 text-sm font-medium shadow-sm hover:shadow"
          >
            Logout
          </button>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            {editingId ? "Edit Staff Member" : "Add Staff Member"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">First Name</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Last Name</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Role</label>
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2"
                placeholder="Instructor, Manager, Front Desk"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">PIN Code</label>
              <input
                name="pinCode"
                value={form.pinCode}
                onChange={handleChange}
                className="w-full rounded-xl border px-3 py-2"
                placeholder="Optional for clock-in"
              />
            </div>

            <div className="flex items-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl border px-4 py-2 font-medium shadow-sm hover:shadow disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Staff Member"
                    : "Add Staff Member"}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border px-4 py-2 font-medium shadow-sm hover:shadow"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Staff List</h2>

          {loading ? (
            <p className="mt-4 text-sm text-gray-600">Loading staff...</p>
          ) : staff.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">No staff members yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">PIN</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((staffMember) => (
                    <tr key={staffMember.id} className="border-b align-top">
                      <td className="py-3 pr-4 font-medium">
                        {staffMember.firstName} {staffMember.lastName}
                      </td>
                      <td className="py-3 pr-4">{staffMember.email || "-"}</td>
                      <td className="py-3 pr-4">{staffMember.role || "-"}</td>
                      <td className="py-3 pr-4">{staffMember.pinCode || "-"}</td>
                      <td className="py-3 pr-4">
                        {staffMember.isActive ? "Active" : "Inactive"}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(staffMember)}
                            className="rounded-lg border px-3 py-1 text-sm hover:shadow"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleActive(staffMember)}
                            className="rounded-lg border px-3 py-1 text-sm hover:shadow"
                          >
                            {staffMember.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}