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
