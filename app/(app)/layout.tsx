import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { getMe } from "@/lib/api";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe();
  if (!user) redirect("/login");

  return (
    <div className="flex bg-page">
      <Sidebar user={user} />
      <main className="flex-1 px-9 py-8">{children}</main>
    </div>
  );
}
