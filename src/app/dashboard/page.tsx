export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="rounded-xl border p-4">
        <h2 className="text-lg font-semibold">Dashboard is loading</h2>
        <p className="mt-2 text-base">No database query on this version.</p>
      </div>
    </div>
  );
}