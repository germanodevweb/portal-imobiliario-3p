import type { Metadata } from "next";
import { AdminHeader } from "@/app/components/admin/AdminHeader";

export const metadata: Metadata = {
  title: "Painel Admin | 3Pinheiros",
  robots: "noindex, nofollow",
};

/**
 * Layout da área administrativa.
 * Isolado do layout público — sem Header/Footer do portal.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        {children}
      </main>
    </div>
  );
}
