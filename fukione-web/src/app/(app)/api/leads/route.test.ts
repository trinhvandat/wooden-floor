import { describe, it, expect, vi, beforeEach } from "vitest";

// vi.hoisted ensures these refs exist when vi.mock factories run (vitest 4.x hoisting).
const { createMock, notifyMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  notifyMock: vi.fn(),
}));

vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("payload", () => ({ getPayload: vi.fn(async () => ({ create: createMock })) }));
vi.mock("@/lib/leads/notify", () => ({ notifyLead: notifyMock }));

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    // No Next request context in unit tests: run the callback now and swallow its
    // result so a best-effort notify failure can't become an unhandled rejection.
    after: (cb: () => unknown) => {
      Promise.resolve(cb()).catch(() => {});
    },
  };
});

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

  it("returns without waiting for the notification to finish", async () => {
    createMock.mockResolvedValue({ id: 9 });
    // notify never settles — the response must still come back.
    notifyMock.mockReturnValue(new Promise<void>(() => {}));
    const res = await POST(post(valid));
    expect(res.status).toBe(200);
    expect(notifyMock).toHaveBeenCalledOnce();
  });
});
