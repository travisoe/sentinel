"use server";

import { redirect } from "next/navigation";
import { sendPasswordReset } from "@/lib/auth";

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (email) {
    // Always return the same public state to prevent account enumeration.
    await sendPasswordReset(email).catch(() => undefined);
  }
  redirect("/forgot-password?sent=1");
}
