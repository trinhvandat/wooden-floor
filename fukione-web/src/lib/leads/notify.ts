import { Resend } from "resend";
import type { LeadInput } from "./schema";

// Resend's shared test sender. Swap to a verified domain address in production.
const FROM = "FUKIONE <onboarding@resend.dev>";

export interface NotifyLead {
  id: string | number;
  name: string;
  phone: string;
  source: LeadInput["source"];
  email?: string;
  message?: string;
  area?: number;
  estimatedCost?: number;
}

function buildHtml(lead: NotifyLead): string {
  const rows: Array<[string, string]> = [
    ["Tên", lead.name],
    ["SĐT", lead.phone],
    ["Email", lead.email || "—"],
    ["Nguồn", lead.source],
    ["Diện tích", lead.area ? `${lead.area} m²` : "—"],
    ["Ước tính", lead.estimatedCost ? `${lead.estimatedCost.toLocaleString("vi-VN")} đ` : "—"],
    ["Ghi chú", lead.message || "—"],
  ];
  return `<h2>Lead mới #${lead.id}</h2><table>${rows
    .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${v}</td></tr>`)
    .join("")}</table>`;
}

/**
 * Best-effort lead notification. NEVER throws: a failure here must not affect the
 * API response — the lead is already persisted (source of truth, gotcha #1).
 */
export async function notifyLead(lead: NotifyLead, retries = 2): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!apiKey || !to) {
    console.warn("[notifyLead] RESEND_API_KEY or LEAD_NOTIFY_EMAIL missing — skipping email");
    return;
  }

  const resend = new Resend(apiKey);
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to,
        subject: `Lead mới: ${lead.name} (${lead.phone})`,
        html: buildHtml(lead),
      });
      if (!error) return;
      console.warn(`[notifyLead] attempt ${attempt + 1} failed:`, error);
    } catch (err) {
      console.warn(`[notifyLead] attempt ${attempt + 1} threw:`, err);
    }
  }
  console.error("[notifyLead] all attempts exhausted for lead", lead.id);
}
