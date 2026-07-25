"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const user = await signIn(email, password);
  if (!user) {
    redirect("/login?error=1");
  }

  redirect(user.role === "sentinel" ? "/admin" : "/dashboard");
}
