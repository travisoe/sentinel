import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ClientRecord,
  HealthBand,
  Issue,
  IssueSeverity,
  IssueStatus,
  PackId,
  PlanId,
  StaffMember,
} from "@/lib/types";

function admin() {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("Supabase is not configured.");
  return client;
}

export async function updateClientPlatform(
  client: string,
  patch: Partial<ClientRecord>,
) {
  const row: Record<string, unknown> = {};
  if (patch.pack !== undefined) row.pack = patch.pack;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.plan !== undefined) row.plan = patch.plan;
  if (patch.billingStatus !== undefined) row.billing_status = patch.billingStatus;
  if (patch.stripeCustomerId !== undefined)
    row.stripe_customer_id = patch.stripeCustomerId;
  if (patch.stripeSubscriptionId !== undefined)
    row.stripe_subscription_id = patch.stripeSubscriptionId;
  if (patch.contactName !== undefined) row.contact_name = patch.contactName;
  if (patch.contactEmail !== undefined) row.contact_email = patch.contactEmail;
  if (patch.contactPhone !== undefined) row.contact_phone = patch.contactPhone;
  if (patch.stationLimit !== undefined) row.station_limit = patch.stationLimit;
  if (patch.healthScore !== undefined) row.health_score = patch.healthScore;
  if (patch.healthBand !== undefined) row.health_band = patch.healthBand;
  if (patch.onboardingStatus !== undefined)
    row.onboarding_status = patch.onboardingStatus;
  if (patch.tagsOrderedAt !== undefined) row.tags_ordered_at = patch.tagsOrderedAt;
  if (patch.tagsShippedAt !== undefined) row.tags_shipped_at = patch.tagsShippedAt;
  if (patch.installedAt !== undefined) row.installed_at = patch.installedAt;
  if (patch.firstScanAt !== undefined) row.first_scan_at = patch.firstScanAt;
  const { error } = await admin().from("clients").update(row).eq("name", client);
  if (error) throw new Error(error.message);
}

export async function listIssues(client: string): Promise<Issue[]> {
  const { data, error } = await admin()
    .from("issues")
    .select("*")
    .eq("client", client)
    .order("opened_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    client: r.client,
    tagId: r.tag_id ?? undefined,
    type: r.type,
    severity: r.severity,
    status: r.status,
    openedBy: r.opened_by,
    openedAt: r.opened_at,
    acknowledgedBy: r.acknowledged_by ?? undefined,
    acknowledgedAt: r.acknowledged_at ?? undefined,
    resolvedBy: r.resolved_by ?? undefined,
    resolvedAt: r.resolved_at ?? undefined,
    notes: r.notes ?? undefined,
    resolution: r.resolution ?? undefined,
  }));
}

export async function openIssue(input: {
  client: string;
  tagId?: string;
  type: string;
  severity?: IssueSeverity;
  openedBy: string;
  notes?: string;
}) {
  let query = admin()
    .from("issues")
    .select("id")
    .eq("client", input.client)
    .eq("type", input.type)
    .in("status", ["open", "acknowledged"]);
  query = input.tagId ? query.eq("tag_id", input.tagId) : query.is("tag_id", null);
  const { data: existing, error: readError } = await query.maybeSingle();
  if (readError) throw new Error(readError.message);
  if (existing) return;

  const { error } = await admin().from("issues").insert({
    client: input.client,
    tag_id: input.tagId ?? null,
    type: input.type,
    severity: input.severity ?? "medium",
    opened_by: input.openedBy,
    notes: input.notes ?? null,
    status: "open",
  });
  if (error && error.code !== "23505") throw new Error(error.message);
}

export async function updateIssue(
  issueId: number,
  patch: {
    status: IssueStatus;
    actor: string;
    resolution?: string;
    note?: string;
  },
) {
  const now = new Date().toISOString();
  const row: Record<string, unknown> = { status: patch.status };
  if (patch.note !== undefined) row.notes = patch.note;
  if (patch.status === "acknowledged") {
    row.acknowledged_by = patch.actor;
    row.acknowledged_at = now;
  }
  if (patch.status === "resolved") {
    row.resolved_by = patch.actor;
    row.resolved_at = now;
    row.resolution = patch.resolution ?? "Resolved";
  }
  const { error } = await admin().from("issues").update(row).eq("id", issueId);
  if (error) throw new Error(error.message);
}

export async function resolveOpenIssuesForTag(
  client: string,
  tagId: string,
  actor: string,
  resolution = "Cleared by a later valid station log.",
) {
  const now = new Date().toISOString();
  const { error } = await admin()
    .from("issues")
    .update({
      status: "resolved",
      resolved_by: actor,
      resolved_at: now,
      resolution,
    })
    .eq("client", client)
    .eq("tag_id", tagId)
    .in("status", ["open", "acknowledged"]);
  if (error) throw new Error(error.message);
}

export async function addCorrectiveAction(input: {
  issueId: number;
  client: string;
  action: string;
  performedBy: string;
}) {
  const { error } = await admin().from("corrective_actions").insert({
    issue_id: input.issueId,
    client: input.client,
    action: input.action,
    performed_by: input.performedBy,
  });
  if (error) throw new Error(error.message);
}

export async function getStaffRoster(client: string): Promise<StaffMember[]> {
  const { data, error } = await admin()
    .from("staff_roster")
    .select("*")
    .eq("client", client)
    .order("display_name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    client: r.client,
    displayName: r.display_name,
    active: r.active,
  }));
}

export async function addStaffMember(client: string, displayName: string) {
  const { error } = await admin()
    .from("staff_roster")
    .upsert({ client, display_name: displayName, active: true });
  if (error) throw new Error(error.message);
}

export async function removeStaffMember(id: number) {
  const { error } = await admin()
    .from("staff_roster")
    .update({ active: false })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getReportPreferences(client: string) {
  const { data, error } = await admin()
    .from("report_preferences")
    .select("*")
    .eq("client", client)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data
    ? {
        enabled: data.weekly_email_enabled as boolean,
        recipientEmail: data.recipient_email as string | null,
        lastSentAt: data.last_sent_at as string | null,
      }
    : { enabled: false, recipientEmail: null, lastSentAt: null };
}

export async function setReportPreferences(
  client: string,
  enabled: boolean,
  recipientEmail?: string,
) {
  const { error } = await admin().from("report_preferences").upsert({
    client,
    weekly_email_enabled: enabled,
    recipient_email: recipientEmail ?? null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function listEnabledReportPreferences() {
  const { data, error } = await admin()
    .from("report_preferences")
    .select("client,recipient_email,last_sent_at")
    .eq("weekly_email_enabled", true)
    .not("recipient_email", "is", null);
  if (error) throw new Error(error.message);
  return (data ?? []) as {
    client: string;
    recipient_email: string;
    last_sent_at: string | null;
  }[];
}

export async function markReportSent(client: string) {
  const { error } = await admin()
    .from("report_preferences")
    .update({ last_sent_at: new Date().toISOString() })
    .eq("client", client);
  if (error) throw new Error(error.message);
}

export async function createSignupIntent(input: {
  email: string;
  company: string;
  contactName: string;
  contactPhone?: string;
  pack: PackId;
  plan: PlanId;
}) {
  const { data, error } = await admin()
    .from("signup_intents")
    .insert({
      email: input.email,
      company: input.company,
      contact_name: input.contactName,
      contact_phone: input.contactPhone ?? null,
      pack: input.pack,
      plan: input.plan,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

export async function attachCheckoutSession(intentId: string, sessionId: string) {
  const { error } = await admin()
    .from("signup_intents")
    .update({ stripe_checkout_session_id: sessionId })
    .eq("id", intentId);
  if (error) throw new Error(error.message);
}

export async function getSignupIntent(intentId: string) {
  const { data, error } = await admin()
    .from("signup_intents")
    .select("*")
    .eq("id", intentId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function completeSignupIntent(intentId: string) {
  const { error } = await admin()
    .from("signup_intents")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", intentId);
  if (error) throw new Error(error.message);
}

export async function provisionPaidClient(input: {
  intentId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}) {
  const intent = await getSignupIntent(input.intentId);
  if (!intent) throw new Error("Signup intent not found.");
  const db = admin();
  const stationLimit =
    intent.plan === "warehouse_starter"
      ? 5
      : intent.plan === "healthcare_starter"
        ? 3
        : null;

  const { error: clientError } = await db.from("clients").upsert(
    {
      name: intent.company,
      pack: intent.pack,
      status: "Active",
      plan: intent.plan,
      billing_status: "active",
      stripe_customer_id: input.stripeCustomerId,
      stripe_subscription_id: input.stripeSubscriptionId,
      contact_name: intent.contact_name,
      contact_email: intent.email,
      contact_phone: intent.contact_phone,
      station_limit: stationLimit,
      onboarding_status: "not_started",
    },
    { onConflict: "name" },
  );
  if (clientError) throw new Error(clientError.message);

  const users = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  let user = users.data.users.find(
    (candidate) => candidate.email?.toLowerCase() === intent.email.toLowerCase(),
  );
  if (!user) {
    const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
    const invited = await db.auth.admin.inviteUserByEmail(intent.email, {
      redirectTo: `${baseUrl}/auth/callback?next=/reset-password`,
      data: { company: intent.company },
    });
    if (invited.error || !invited.data.user) {
      throw new Error(invited.error?.message ?? "Could not invite account owner.");
    }
    user = invited.data.user;
  }

  const updated = await db.auth.admin.updateUserById(user.id, {
    app_metadata: { role: "owner", client: intent.company },
  });
  if (updated.error) throw new Error(updated.error.message);

  const { error: profileError } = await db.from("profiles").upsert({
    id: user.id,
    email: intent.email,
    role: "owner",
    client: intent.company,
  });
  if (profileError) throw new Error(profileError.message);

  await completeSignupIntent(input.intentId);
}

export async function syncClientBilling(
  stripeCustomerId: string,
  billingStatus: ClientRecord["billingStatus"],
  stripeSubscriptionId?: string,
) {
  const row: Record<string, unknown> = { billing_status: billingStatus };
  if (stripeSubscriptionId) row.stripe_subscription_id = stripeSubscriptionId;
  const { error } = await admin()
    .from("clients")
    .update(row)
    .eq("stripe_customer_id", stripeCustomerId);
  if (error) throw new Error(error.message);
}

export async function persistHealth(
  client: string,
  healthScore: number,
  healthBand: HealthBand,
) {
  await updateClientPlatform(client, { healthScore, healthBand });
}
