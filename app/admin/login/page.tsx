import Link from "next/link";

import { loginAdminAction } from "@/lib/admin/actions";
import { isAdminEnabled } from "@/lib/config/features";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  if (!isAdminEnabled()) {
    return (
      <div className="site-shell py-16">
        <p className="text-slate-grey">Admin is not enabled.</p>
      </div>
    );
  }

  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-stone-50 px-4">
      <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="font-heading text-3xl text-tangaroa">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate-grey">
          Orders dashboard for BDK Supply.
        </p>
        <form action={loginAdminAction} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-tangaroa"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          {params.error ? (
            <p className="text-sm text-red-600">Invalid password.</p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-md bg-tangaroa px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-white"
          >
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-grey">
          <Link href="/cms" className="font-semibold text-tangaroa hover:text-warm-stone-600">
            Open CMS
          </Link>
        </p>
      </div>
    </div>
  );
}
