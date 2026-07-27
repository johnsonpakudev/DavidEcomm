import { isAdminEnabled } from "@/lib/config/features";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isAdminEnabled()) {
    return (
      <div className="site-shell py-16">
        <p className="text-slate-grey">Admin is not enabled.</p>
      </div>
    );
  }

  return children;
}
