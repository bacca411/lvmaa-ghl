import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StaffClientPage from "./staff-client-page";

export default async function StaffPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("lvmaa_admin")?.value === "true";

  if (!isAdmin) {
    redirect("/admin/login");
  }

  return <StaffClientPage />;
}