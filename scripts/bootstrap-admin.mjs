import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const email = process.env.SENTINEL_ADMIN_EMAIL;
const password = process.env.SENTINEL_ADMIN_PASSWORD;

if (!url || !key || !email || !password) {
  throw new Error(
    "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, SENTINEL_ADMIN_EMAIL, and SENTINEL_ADMIN_PASSWORD.",
  );
}
if (password.length < 12) {
  throw new Error("SENTINEL_ADMIN_PASSWORD must be at least 12 characters.");
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const listed = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
let user = listed.data.users.find(
  (candidate) => candidate.email?.toLowerCase() === email.toLowerCase(),
);
if (!user) {
  const created = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role: "sentinel" },
  });
  if (created.error || !created.data.user) {
    throw created.error ?? new Error("Could not create Sentinel admin.");
  }
  user = created.data.user;
} else {
  const updated = await supabase.auth.admin.updateUserById(user.id, {
    password,
    app_metadata: { ...user.app_metadata, role: "sentinel" },
  });
  if (updated.error) throw updated.error;
}

const profile = await supabase.from("profiles").upsert({
  id: user.id,
  email,
  role: "sentinel",
  client: null,
});
if (profile.error) throw profile.error;
console.log(`Sentinel admin ready: ${email}`);
