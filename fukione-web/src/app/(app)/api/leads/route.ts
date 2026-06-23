import { NextResponse, after } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { leadInputSchema } from "@/lib/leads/schema";
import { notifyLead } from "@/lib/leads/notify";

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Yêu cầu không hợp lệ" }, { status: 400 });
  }

  // Honeypot: a filled "website" field means a bot — feign success, create nothing.
  if (
    body &&
    typeof body === "object" &&
    "website" in body &&
    (body as { website?: string }).website
  ) {
    return NextResponse.json({ success: true, data: null });
  }

  const parsed = leadInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 },
    );
  }

  // Drop the honeypot field; keep email separate so we only persist it when present.
  const { email } = parsed.data;
  const { name, phone, source, message, address, preferredTime, productId, area, estimatedCost } = parsed.data;
  const data = {
    name, phone, source, message, address, preferredTime, area, estimatedCost,
    productId: productId ? Number(productId) : undefined,
  };

  let leadId: string | number;
  try {
    const payload = await getPayload({ config });
    const created = await payload.create({
      collection: "leads",
      data: { ...data, ...(email ? { email } : {}), status: "new" },
    });
    leadId = created.id;
  } catch (err) {
    console.error("[/api/leads] DB create failed:", err);
    return NextResponse.json(
      { success: false, error: "Không thể lưu thông tin, vui lòng thử lại." },
      { status: 500 },
    );
  }

  // Notify AFTER the response is flushed so the user isn't blocked on email.
  // notifyLead is best-effort and never throws; the lead is already persisted (gotcha #1).
  after(() =>
    notifyLead({
      id: leadId,
      name: data.name,
      phone: data.phone,
      source: data.source,
      email,
      message: data.message,
      area: data.area,
      estimatedCost: data.estimatedCost,
    }),
  );

  return NextResponse.json({ success: true, data: { id: leadId } });
}
