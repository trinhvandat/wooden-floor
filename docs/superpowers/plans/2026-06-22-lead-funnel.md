# Lead Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire `SurveyForm` and `LeadFormSheet` end-to-end so a submission validates, persists a Lead to the DB, and triggers a best-effort email notification.

**Architecture:** Both client forms POST JSON to a single Next.js Route Handler `/api/leads`. The handler runs a honeypot check, validates with a shared Zod schema, writes the Lead via Payload's Local API (source of truth), then calls a best-effort Resend notifier that never affects the response. On success the form navigates to `/cam-on`.

**Tech Stack:** Next.js 14+ App Router, Payload CMS 3 (Local API), Postgres (Neon), Zod, Resend, Vitest, Playwright. Package manager **pnpm**. Tests run with `vitest run`.

## Global Constraints

- All code, comments, and copy in repo artifacts are **English**; Vietnamese only appears in user-facing UI strings (already present). (CLAUDE.md conventions)
- **Leads must never be lost:** write the Lead to the DB **first**; email is a separate best-effort step with retry. A failed email must never fail the request. (Gotcha #1)
- Unit costs / prices are **not** hardcoded — they come from the calculator/`Settings`; this code path only forwards already-computed `estimatedCost`. (Gotcha)
- Public URLs stay Vietnamese-no-accent; `/cam-on` already rewrites to `/thank-you` via `next.config.ts`. Do **not** change routing.
- Validate at boundaries with Zod; many small focused files; immutable updates. (CLAUDE.md code style)
- Run all `pnpm`/`vitest` commands from the `fukione-web/` directory.
- Alias: `@/*` → `fukione-web/src/*`; `@payload-config` → `fukione-web/payload.config.ts`.

---

### Task 1: Lead input schema (Zod)

**Files:**
- Create: `fukione-web/src/lib/leads/schema.ts`
- Test: `fukione-web/src/lib/leads/schema.test.ts`

**Interfaces:**
- Consumes: nothing (leaf module).
- Produces:
  - `LEAD_SOURCES: readonly ["calculator","survey","quote","zalo"]`
  - `leadInputSchema` (Zod object) with fields `name, phone, email?, source, message?, address?, preferredTime?, productId?, area?, estimatedCost?, website?`
  - `type LeadInput = z.infer<typeof leadInputSchema>` — `phone` is normalised (spaces/dots stripped).

- [ ] **Step 1: Install zod**

Run: `cd fukione-web && pnpm add zod`
Expected: `zod` appears under `dependencies` in `fukione-web/package.json`.

- [ ] **Step 2: Write the failing test**

Create `fukione-web/src/lib/leads/schema.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { leadInputSchema } from "./schema";

describe("leadInputSchema", () => {
  it("accepts a valid survey lead", () => {
    const r = leadInputSchema.safeParse({
      name: "Nguyen Van A",
      phone: "0901234567",
      source: "survey",
    });
    expect(r.success).toBe(true);
  });

  it("normalises spaced phone numbers", () => {
    const r = leadInputSchema.safeParse({
      name: "A",
      phone: "0901 234 567",
      source: "quote",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.phone).toBe("0901234567");
  });

  it("rejects a missing phone", () => {
    const r = leadInputSchema.safeParse({ name: "A", source: "survey" });
    expect(r.success).toBe(false);
  });

  it("rejects an unknown source", () => {
    const r = leadInputSchema.safeParse({
      name: "A",
      phone: "0901234567",
      source: "facebook",
    });
    expect(r.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd fukione-web && pnpm vitest run src/lib/leads/schema.test.ts`
Expected: FAIL — cannot resolve `./schema`.

- [ ] **Step 4: Write minimal implementation**

Create `fukione-web/src/lib/leads/schema.ts`:

```ts
import { z } from "zod";

// Mirrors the `source` options in the Leads collection.
export const LEAD_SOURCES = ["calculator", "survey", "quote", "zalo"] as const;

export const leadInputSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập họ tên").max(120),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.]/g, ""))
    .pipe(z.string().regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ")),
  email: z.string().trim().email("Email không hợp lệ").optional().or(z.literal("")),
  source: z.enum(LEAD_SOURCES),
  message: z.string().trim().max(2000).optional(),
  address: z.string().trim().max(300).optional(),
  preferredTime: z.string().trim().max(120).optional(),
  productId: z.string().trim().optional(),
  area: z.number().min(0).optional(),
  estimatedCost: z.number().min(0).optional(),
  // Honeypot — must stay empty for real users.
  website: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadInputSchema>;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd fukione-web && pnpm vitest run src/lib/leads/schema.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add fukione-web/package.json fukione-web/pnpm-lock.yaml fukione-web/src/lib/leads/schema.ts fukione-web/src/lib/leads/schema.test.ts
git commit -m "feat: add shared lead input zod schema"
```

---

### Task 2: Best-effort email notifier (Resend)

**Files:**
- Create: `fukione-web/src/lib/leads/notify.ts`
- Test: `fukione-web/src/lib/leads/notify.test.ts`
- Modify: `fukione-web/.env.example`

**Interfaces:**
- Consumes: `LeadInput` type from `./schema`.
- Produces:
  - `interface NotifyLead` = `{ id: string | number; name: string; phone: string; source: LeadInput["source"]; email?: string; message?: string; area?: number; estimatedCost?: number }`
  - `notifyLead(lead: NotifyLead, retries?: number): Promise<void>` — never throws; no-ops if env missing.

- [ ] **Step 1: Install resend**

Run: `cd fukione-web && pnpm add resend`
Expected: `resend` appears under `dependencies`.

- [ ] **Step 2: Write the failing test**

Create `fukione-web/src/lib/leads/notify.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn(() => ({ emails: { send: sendMock } })),
}));

import { notifyLead } from "./notify";

const lead = { id: 1, name: "A", phone: "0901234567", source: "survey" as const };

beforeEach(() => {
  sendMock.mockReset();
  process.env.RESEND_API_KEY = "re_test";
  process.env.LEAD_NOTIFY_EMAIL = "owner@fukione.vn";
});

describe("notifyLead", () => {
  it("sends one email on success", async () => {
    sendMock.mockResolvedValue({ error: null });
    await notifyLead(lead);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("retries then gives up without throwing", async () => {
    sendMock.mockResolvedValue({ error: { message: "rate limited" } });
    await expect(notifyLead(lead, 2)).resolves.toBeUndefined();
    expect(sendMock).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it("no-ops when env is missing", async () => {
    delete process.env.RESEND_API_KEY;
    await notifyLead(lead);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd fukione-web && pnpm vitest run src/lib/leads/notify.test.ts`
Expected: FAIL — cannot resolve `./notify`.

- [ ] **Step 4: Write minimal implementation**

Create `fukione-web/src/lib/leads/notify.ts`:

```ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd fukione-web && pnpm vitest run src/lib/leads/notify.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Document the new env vars**

Append to `fukione-web/.env.example`:

```
# Resend — lead notification emails (server-only). Best-effort: if unset, the
# app still saves leads to the DB and simply skips the email.
RESEND_API_KEY=
# Inbox that receives a notification for every new lead.
LEAD_NOTIFY_EMAIL=
```

- [ ] **Step 7: Commit**

```bash
git add fukione-web/package.json fukione-web/pnpm-lock.yaml fukione-web/src/lib/leads/notify.ts fukione-web/src/lib/leads/notify.test.ts fukione-web/.env.example
git commit -m "feat: add best-effort resend lead notifier"
```

---

### Task 3: Route handler `POST /api/leads`

**Files:**
- Create: `fukione-web/src/app/(app)/api/leads/route.ts`
- Test: `fukione-web/src/app/(app)/api/leads/route.test.ts`

**Interfaces:**
- Consumes: `leadInputSchema` (Task 1), `notifyLead`/`NotifyLead` (Task 2), Payload Local API `getPayload`, `@payload-config`.
- Produces: `POST(req: Request): Promise<Response>` returning `{ success: true, data: { id } | null }` or `{ success: false, error }`.

> **Collision check:** Payload's catch-all (`src/app/(payload)/api/[...slug]`) also serves `/api/*`. A static `(app)/api/leads/route.ts` is more specific and shadows it. After Step 5, run the dev server and `curl` the endpoint (Step 6) to confirm. If Next.js reports a parallel-path conflict, move the file to `(app)/api/leads/submit/route.ts`, update the path here and the form fetch URLs in Task 4.

- [ ] **Step 1: Configure Vitest alias resolution**

The route module imports `@/lib/...` aliases, which Vitest does not resolve by default (existing tests use relative imports). Install the tsconfig-paths resolver and add a Vitest config.

Run: `cd fukione-web && pnpm add -D vite-tsconfig-paths`

Create `fukione-web/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
});
```

- [ ] **Step 2: Write the failing test**

Create `fukione-web/src/app/(app)/api/leads/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const createMock = vi.fn();
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("payload", () => ({ getPayload: vi.fn(async () => ({ create: createMock })) }));
const notifyMock = vi.fn();
vi.mock("@/lib/leads/notify", () => ({ notifyLead: notifyMock }));

import { POST } from "./route";

function post(body: unknown): Request {
  return new Request("http://localhost/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const valid = { name: "Nguyen Van A", phone: "0901234567", source: "survey" };

beforeEach(() => {
  createMock.mockReset();
  notifyMock.mockReset();
  notifyMock.mockResolvedValue(undefined);
});

describe("POST /api/leads", () => {
  it("creates a lead and returns its id", async () => {
    createMock.mockResolvedValue({ id: 42 });
    const res = await POST(post(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, data: { id: 42 } });
    expect(createMock).toHaveBeenCalledOnce();
    expect(notifyMock).toHaveBeenCalledOnce();
  });

  it("silently drops honeypot submissions", async () => {
    const res = await POST(post({ ...valid, website: "spam" }));
    expect(res.status).toBe(200);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("rejects invalid input with 400", async () => {
    const res = await POST(post({ name: "A", source: "survey" })); // no phone
    expect(res.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 500 when the DB write fails and never notifies", async () => {
    createMock.mockRejectedValue(new Error("db down"));
    const res = await POST(post(valid));
    expect(res.status).toBe(500);
    expect((await res.json()).success).toBe(false);
    expect(notifyMock).not.toHaveBeenCalled();
  });

  it("still returns 200 when notification throws", async () => {
    createMock.mockResolvedValue({ id: 7 });
    notifyMock.mockRejectedValue(new Error("resend down"));
    const res = await POST(post(valid));
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd fukione-web && pnpm vitest run "src/app/(app)/api/leads/route.test.ts"`
Expected: FAIL — cannot resolve `./route`.

- [ ] **Step 4: Write minimal implementation**

Create `fukione-web/src/app/(app)/api/leads/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { leadInputSchema } from "@/lib/leads/schema";
import { notifyLead } from "@/lib/leads/notify";

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
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

  // Drop the honeypot; keep email separate so we only persist it when present.
  const { website: _hp, email, ...data } = parsed.data;

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

  // Best-effort notification — never let it affect the response (defence in depth;
  // notifyLead is already designed not to throw).
  try {
    await notifyLead({
      id: leadId,
      name: data.name,
      phone: data.phone,
      source: data.source,
      email,
      message: data.message,
      area: data.area,
      estimatedCost: data.estimatedCost,
    });
  } catch (err) {
    console.error("[/api/leads] notify failed:", err);
  }

  return NextResponse.json({ success: true, data: { id: leadId } });
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd fukione-web && pnpm vitest run "src/app/(app)/api/leads/route.test.ts"`
Expected: PASS (5 tests).

- [ ] **Step 6: Verify the full unit/integration suite is green**

Run: `cd fukione-web && pnpm vitest run`
Expected: PASS — existing calculator tests plus the new schema/notify/route tests.

- [ ] **Step 7: Manually confirm the route shadows Payload's `/api` (no parallel-path error)**

Run (in one shell): `cd fukione-web && pnpm dev`
Then in another shell:

```bash
curl -s -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"0901234567","source":"quote"}'
```

Expected: JSON `{"success":true,"data":{"id":...}}` and a new row under `/admin` → Leads. If dev fails to compile with a parallel-routes error, apply the fallback in the collision-check note above. Stop the dev server when done.

- [ ] **Step 8: Commit**

```bash
git add fukione-web/package.json fukione-web/pnpm-lock.yaml fukione-web/vitest.config.ts \
  "fukione-web/src/app/(app)/api/leads/route.ts" "fukione-web/src/app/(app)/api/leads/route.test.ts"
git commit -m "feat: add POST /api/leads route handler"
```

---

### Task 4: Wire both forms to `/api/leads`

**Files:**
- Modify: `fukione-web/src/components/SurveyForm.tsx` (`handleSubmit`, lines 38–42; submit button, lines 178–183)
- Modify: `fukione-web/src/components/LeadFormSheet.tsx` (`LeadContext`, lines 18–22; `handleSubmit`, lines 41–45; submit button, lines 160–165)
- Modify: `fukione-web/src/components/CalculatorWidget.tsx` (context object, lines 196–204)

**Interfaces:**
- Consumes: `POST /api/leads` (Task 3). No new exports.
- Produces: `LeadContext` gains `productId?: string`.

- [ ] **Step 1: Rewrite `SurveyForm` submit handler + state**

In `fukione-web/src/components/SurveyForm.tsx`, replace the `handleSubmit` function (lines 38–42):

```tsx
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "survey",
          name,
          phone,
          address,
          preferredTime: timeSlot,
          message: note,
          website,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Gửi không thành công, vui lòng thử lại.");
      }
      router.push("/cam-on");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại.");
      setLoading(false);
    }
  }
```

- [ ] **Step 2: Show the error + disable the button while submitting**

In `fukione-web/src/components/SurveyForm.tsx`, replace the submit button block (lines 178–183) with:

```tsx
        {error && (
          <p className="text-[12.5px] font-semibold text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 w-full rounded-pill bg-cta text-sm font-bold text-ink shadow-cta transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
        >
          {loading ? "Đang gửi..." : "Đặt lịch khảo sát"}
        </button>
```

- [ ] **Step 3: Extend `LeadContext` with `productId`**

In `fukione-web/src/components/LeadFormSheet.tsx`, update the interface (lines 18–22):

```tsx
export interface LeadContext {
  productId?: string;
  productName: string;
  areaM2: number;
  total: number;
}
```

- [ ] **Step 4: Rewrite `LeadFormSheet` submit handler + state**

In `fukione-web/src/components/LeadFormSheet.tsx`, replace the `handleSubmit` function (lines 41–45):

```tsx
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: context ? "calculator" : "quote",
          name,
          phone,
          email,
          message: note,
          productId: context?.productId,
          area: context?.areaM2,
          estimatedCost: context?.total,
          website,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Gửi không thành công, vui lòng thử lại.");
      }
      router.push("/cam-on");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại.");
      setLoading(false);
    }
  }
```

- [ ] **Step 5: Show the error + disable the sheet's submit button**

In `fukione-web/src/components/LeadFormSheet.tsx`, replace the submit button block (lines 160–165) with:

```tsx
            {error && (
              <p className="text-[12.5px] font-semibold text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-pill bg-cta text-sm font-bold text-ink shadow-cta transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
            >
              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
```

- [ ] **Step 6: Pass `productId` from the calculator**

In `fukione-web/src/components/CalculatorWidget.tsx`, update the context object (lines 196–204):

```tsx
        context={
          hasResult
            ? {
                productId: activeProduct.id,
                productName: activeProduct.name,
                areaM2,
                total: estimate.total,
              }
            : undefined
        }
```

- [ ] **Step 7: Type-check and lint**

Run: `cd fukione-web && pnpm lint`
Expected: no errors in the three modified files.

- [ ] **Step 8: Manual smoke test**

Run: `cd fukione-web && pnpm dev`, open `/bao-gia`, fill the calculator, click "Nhận báo giá", complete the sheet, submit. Expected: navigates to `/cam-on`; a Lead with `source: calculator` and the product relationship appears in `/admin`. Stop the server when done.

- [ ] **Step 9: Commit**

```bash
git add fukione-web/src/components/SurveyForm.tsx fukione-web/src/components/LeadFormSheet.tsx fukione-web/src/components/CalculatorWidget.tsx
git commit -m "feat: wire survey and lead-sheet forms to /api/leads"
```

---

### Task 5: E2E golden flow (Playwright)

**Files:**
- Create: `fukione-web/playwright.config.ts`
- Create: `fukione-web/e2e/lead-funnel.spec.ts`
- Modify: `fukione-web/package.json` (add `test:e2e` script)

**Interfaces:**
- Consumes: the running app (`pnpm dev`) and the wired forms (Task 4). The test stubs `/api/leads` via Playwright route interception, so it needs neither a real DB write nor Resend.

- [ ] **Step 1: Install Playwright**

Run: `cd fukione-web && pnpm add -D @playwright/test && pnpm exec playwright install chromium`
Expected: `@playwright/test` under `devDependencies`; Chromium downloaded.

- [ ] **Step 2: Add the `test:e2e` script**

In `fukione-web/package.json`, add to `scripts`:

```json
    "test:e2e": "playwright test",
```

- [ ] **Step 3: Create the Playwright config**

Create `fukione-web/playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

- [ ] **Step 4: Write the golden-flow spec**

Create `fukione-web/e2e/lead-funnel.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("calculate cost then leave a lead", async ({ page }) => {
  // Stub the API so the flow is deterministic and writes no real data.
  await page.route("**/api/leads", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: { id: 1 } }),
    }),
  );

  await page.goto("/bao-gia");
  await page.getByRole("button", { name: "Nhận báo giá" }).click();

  await page.getByLabel("Họ tên").fill("Nguyen Van A");
  await page.getByLabel("Số điện thoại").fill("0901234567");
  await page.getByRole("button", { name: "Gửi yêu cầu" }).click();

  await expect(page).toHaveURL(/\/cam-on/);
});
```

- [ ] **Step 5: Run the e2e test**

Run: `cd fukione-web && pnpm test:e2e`
Expected: PASS (1 test). If the calculator's "Nhận báo giá" button or the labels differ on `/bao-gia`, adjust the selectors to match the rendered page (verify with `pnpm exec playwright test --debug`).

- [ ] **Step 6: Ignore Playwright artifacts**

Append to `fukione-web/.gitignore` (create the lines if absent):

```
/test-results/
/playwright-report/
/playwright/.cache/
```

- [ ] **Step 7: Commit**

```bash
git add fukione-web/package.json fukione-web/pnpm-lock.yaml fukione-web/playwright.config.ts fukione-web/e2e/lead-funnel.spec.ts fukione-web/.gitignore
git commit -m "test: add lead-funnel e2e golden flow"
```

---

## Final verification

- [ ] `cd fukione-web && pnpm vitest run` — all unit/integration tests pass.
- [ ] `cd fukione-web && pnpm test:e2e` — golden flow passes.
- [ ] `cd fukione-web && pnpm lint` — clean.
- [ ] Manual: a real submission (with `.env` `RESEND_API_KEY` + `LEAD_NOTIFY_EMAIL` set) creates a Lead in `/admin` and delivers a notification email; with those unset, the Lead is still created and the email is skipped.
- [ ] Open a PR `feat/lead-funnel` → `master`; run the separate review pass (`/review-pr`) before merge.
