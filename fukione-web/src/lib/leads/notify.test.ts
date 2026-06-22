import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: vi.fn(function () {
    return { emails: { send: sendMock } };
  }),
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
