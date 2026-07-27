import Link from "next/link";

import { logoutAdminAction } from "@/lib/admin/actions";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-warm-stone-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="site-shell flex items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <Link href="/admin/orders" className="font-heading text-xl text-tangaroa">
              BDK Admin
            </Link>
            <Link
              href="/cms"
              className="text-sm font-semibold text-tangaroa hover:text-warm-stone-600"
            >
              Edit homepage
            </Link>
          </div>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="text-sm font-semibold text-slate-grey hover:text-tangaroa"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="site-shell py-8">{children}</main>
    </div>
  );
}
