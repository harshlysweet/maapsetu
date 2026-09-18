"use server";

import { clearSession } from "@/lib/auth";
import { loginWithPassword, registerTrader } from "@/lib/auth-credentials";

export async function loginAction(formData: FormData) {
  return await loginWithPassword(String(formData.get("email") || ""), String(formData.get("password") || ""));
}

export async function registerAction(formData: FormData) {
  return await registerTrader(Object.fromEntries(formData.entries()));
}

export async function logoutAction() {
  await clearSession();
  return { ok: true as const };
}
