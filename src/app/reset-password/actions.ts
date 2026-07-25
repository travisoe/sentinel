"use server";

import { redirect } from "next/navigation";
import { updatePassword } from "@/lib/auth";

export async function resetPasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 10) redirect("/reset-password?error=length");
  await updatePassword(password).catch(() => {
    redirect("/reset-password?error=session");
  });
  redirect("/login?reset=1");
}
