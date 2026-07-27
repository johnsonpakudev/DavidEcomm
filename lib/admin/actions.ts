"use server";

import "server-only";

import { redirect } from "next/navigation";

import {
  clearAdminSessionCookie,
  setAdminSessionCookie,
  verifyAdminPassword,
} from "@/lib/admin/auth";
import { isAdminEnabled } from "@/lib/config/features";

export async function loginAdminAction(formData: FormData) {
  if (!isAdminEnabled()) {
    redirect("/");
  }

  const password = String(formData.get("password") ?? "");

  if (!verifyAdminPassword(password)) {
    redirect("/admin/login?error=1");
  }

  await setAdminSessionCookie();
  redirect("/admin/orders");
}

export async function logoutAdminAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
