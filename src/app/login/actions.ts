"use server";

import { redirect } from "next/navigation";
import { createSession, verifyCredentials } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = verifyCredentials(email, password);
  if (!user) {
    redirect("/login?error=1");
  }

  await createSession(user);
  redirect(user.role === "sentinel" ? "/admin" : "/dashboard");
}
