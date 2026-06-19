# FUKIONE — Website Bán Lẻ Sàn Gỗ (B2C) — Design Doc

**Ngày:** 2026-06-20
**Trạng thái:** Đã duyệt thiết kế, chuẩn bị lập kế hoạch triển khai
**Phạm vi:** Phase 1 — Website bán lẻ B2C tại Hà Nội

---

## 1. Mục tiêu & Bối cảnh

### Vấn đề
FUKIONE hiện kinh doanh theo mô hình **phân phối**. Mục tiêu mới: mở thêm kênh **bán lẻ B2C** trực tiếp tới người tiêu dùng cuối tại Hà Nội thông qua một website, nhằm **tăng doanh thu bán lẻ** và xây dựng thương hiệu trực tuyến.

### Bản chất sản phẩm: Lead-gen-first commerce
Sàn gỗ là mặt hàng **giá trị cao, cần tư vấn, nặng & cồng kềnh**. Khách hầu như luôn muốn được tư vấn trước khi chốt. Vì vậy website KHÔNG phải một sàn TMĐT phức tạp (giỏ hàng, thanh toán online, tồn kho realtime) mà là một **"cỗ máy tạo lead"**:

> Website xây niềm tin + báo giá nhanh → thu thập lead → sale chốt đơn qua tư vấn (Zalo/điện thoại). Nút "mua trực tiếp" có thể bổ sung sau nhưng là luồng phụ.

Giá trị thắng/thua nằm ở: **SEO mạnh + tốc độ + tỷ lệ chốt lead**, KHÔNG phải ở backend phức tạp. Vốn và thời gian đổ vào **content + conversion**, không phải hạ tầng.

### Thông số chốt

| Yếu tố | Quyết định |
|---|---|
| Mô hình | B2C bán lẻ, lead-gen-first |
| Khu vực | Hà Nội (Phase 1) |
| Sản phẩm | Vật liệu + lắp đặt (báo giá nhanh + đặt lịch khảo sát thực tế) |
| Catalog | 52 mã sản phẩm, cần bộ lọc |
| Content | Hiện chỉ có ảnh; thiếu specs + mô tả + nội dung SEO (làm song song, bổ sung dần qua CMS) |
| Showroom | Có showroom vật lý tại Hà Nội → lên Google Maps |
| Người triển khai | Background Java/Spring, React, KMP; ưu tiên tối ưu chi phí |

### Định hướng dài hạn (ngoài phạm vi Phase 1)
- **Phase 2 — Dealer Portal (B2B):** Tận dụng mạng phân phối sẵn có. Giá sỉ theo tier, quote generator, technical library, chiết khấu theo volume. Khi đó logic phức tạp → **bổ sung một Spring Boot service đọc chung PostgreSQL** (đúng lúc cần, không phí tiền sớm).
- **Phase 3 — Virtual Experience:** AR room visualizer, đặt lịch tham quan showroom, "find nearest dealer" map.

Kiến trúc Phase 1 được chọn để **tiến hoá được** sang các phase sau mà không phải làm lại.

---

## 2. Kiến trúc tổng thể

```
                   NGƯỜI DÙNG
        (Google search → landing page, Zalo, Maps)
                        │
        ┌───────────────▼────────────────┐
        │       NEXT.JS (App Router)       │
        │  • SSG/ISR cho SP & blog → SEO   │
        │  • Tailwind + shadcn/ui          │
        │  • Form báo giá / đặt lịch        │
        └───────┬──────────────────┬───────┘
                │                  │
      ┌─────────▼────────┐ ┌───────▼──────────┐
      │  PAYLOAD CMS 3    │ │  LEAD HANDLER     │
      │  (trong app       │ │  • Lưu lead → DB  │
      │   Next.js)        │ │  • Email noti     │
      │  • 52 mã SP       │ │  • Anti-spam      │
      │  • Bộ sưu tập     │ └──────────────────┘
      │  • Bài viết       │
      │  • Settings (giá) │
      │  • Leads (CRM)    │
      └─────────┬─────────┘
                │
        ┌───────▼────────┐
        │  PostgreSQL     │  ← dữ liệu của FUKIONE, sở hữu hoàn toàn
        │  (Neon/Supabase)│     (Phase 2 Spring Boot đọc chung DB này)
        └────────────────┘

  Tích hợp ngoài: Zalo OA widget · Google Analytics 4 ·
                  Google Search Console · Google Business Profile/Maps
```

### Stack

| Lớp | Công nghệ | Lý do |
|---|---|---|
| Frontend/SSR | **Next.js 14+ App Router** | SEO + tốc độ; tận dụng kỹ năng React |
| CMS + API + Admin | **Payload CMS 3** (embedded trong Next.js) | Schema bằng code (giống `@Entity`), 1 deploy, làm chủ data |
| Database | **PostgreSQL** (Neon/Supabase free tier) | Sở hữu data; liền mạch với Spring Boot Phase 2 |
| UI | **Tailwind CSS + shadcn/ui** | Đẹp, dựng nhanh, dễ tuỳ biến |
| Validation | **Zod** | Validate form ở cả client & server |
| Email | **Resend** | Free tier 3k/tháng; gửi noti lead |
| Hosting | **Vercel** | Free tier, auto deploy, CDN |
| Chat tư vấn | **Zalo OA widget** | Kênh tư vấn chính của khách Việt |
| Analytics/SEO | **GA4 + Google Search Console** | Đo lead, theo dõi SEO |

### Vì sao Payload 3 (không phải Sanity/WordPress)
- **Schema bằng code** — tư duy quen thuộc với dân Spring (`@Entity`).
- **PostgreSQL tự sở hữu** — Phase 2 Spring Boot đọc chung DB được.
- **1 deploy duy nhất** (web + CMS + API gói chung) → rẻ, đơn giản vận hành.
- **Mã nguồn mở, self-host** — không khoá vào nhà cung cấp.
- Payload tự sinh: trang admin `/admin`, REST + GraphQL API, bảng Postgres.

---

## 3. Cấu trúc trang (Sitemap)

### Nhóm chuyển đổi (Conversion)
```
/                        Trang chủ — hero, USP, SP nổi bật, CTA tư vấn
/san-pham                Danh mục 52 mã — bộ lọc (màu/độ dày/chống nước/giá/phòng)
/san-pham/[slug]         Chi tiết SP — ảnh lớn, specs, "Tính chi phí", CTA báo giá
/bao-gia                 Form báo giá nhanh (nhập m² → ước tính vật liệu + lắp đặt)
/dat-lich-khao-sat       Form đặt lịch khảo sát miễn phí
```

### Nhóm SEO & Niềm tin (Trust)
```
/bo-suu-tap/[slug]       Bộ sưu tập theo concept (vd "Sàn gỗ cho phòng khách")
/blog                    Danh sách bài viết SEO
/blog/[slug]             Chi tiết bài viết
/du-an                   Công trình thực tế đã thi công (vũ khí chốt đơn)
/ve-chung-toi            Giới thiệu thương hiệu FUKIONE
/lien-he                 Liên hệ + Google Maps showroom HN
```

### Trang kỹ thuật
```
/admin                   Trang quản trị Payload
sitemap.xml, robots.txt  Tự động sinh cho Google
```

**Nguyên tắc:**
- URL **tiếng Việt không dấu** (`/san-pham`, `/bao-gia`) — chuẩn SEO thị trường VN.
- `/du-an` đưa vào ngay Phase 1 (ảnh công trình bổ sung dần) — social proof mạnh nhất ngành sàn gỗ.
- `/blog` là cỗ máy SEO dài hạn, biến người tìm kiếm thành lead.

---

## 4. Luồng chốt Lead (trái tim của sản phẩm)

Thiết kế **nhiều "cửa" thu lead**, không ép khách vào một đường duy nhất:

```
        KHÁCH VÀO WEB (Google / Zalo / Maps)
                      │
   ┌──────────┬───────┴────────┬────────────┐
   ▼          ▼               ▼            ▼
Xem SP    Đọc blog     Xem công trình   Click Zalo
   │          │               │            │
   └──────────┴───────┬───────┴────────────┘
                      ▼
   ┌──────────────────────────────────────────┐
   │        CÁC "CỬA" THU LEAD (CTA)            │
   │  1. "Tính chi phí nhanh" → nhập m²         │
   │  2. "Đặt lịch khảo sát miễn phí"           │
   │  3. "Nhận báo giá" → form ngắn             │
   │  4. Zalo chat                              │
   └──────────────────┬───────────────────────┘
                      ▼
            LEAD tạo trong DB (Payload)
                      │
         ┌────────────┴────────────┐
         ▼                        ▼
  Email noti cho sale      Màn hình cảm ơn cho khách
         │
         ▼
  SALE GỌI / ZALO CHỐT TƯ VẤN
```

### Công cụ "Tính chi phí nhanh" (tính năng chốt đơn chủ lực)
```
Input:   Diện tích phòng: [ 25 ] m²
         Chọn sản phẩm:   [ Sàn gỗ FUKIONE F8-12mm ]
         Có lắp đặt?      [✓] Có

Output:  Vật liệu:   25 × 450.000đ = 11.250.000đ
         Lắp đặt:    25 ×  80.000đ =  2.000.000đ
         Phào nẹp (ước tính)       =    ~800.000đ
         ─────────────────────────────────────
         TẠM TÍNH:                 ~14.050.000đ

         [ Nhận báo giá chính xác ] → form Tên + SĐT → LEAD
         * Giá cuối phụ thuộc khảo sát thực tế
```
Tâm lý: cho con số trước → minh bạch + tin tưởng; luôn kèm "giá cuối cần khảo sát" → mở đường cho sale tư vấn & upsell.

**Đơn giá (lắp đặt, phào nẹp...) cấu hình trong collection `Settings`** — không cần đụng code.

### Form & dữ liệu khách
- **Bắt buộc:** Tên + SĐT. **Tuỳ chọn:** Email. (Form càng ngắn → lead càng nhiều.)

### Thông báo lead
- **Email qua Resend** về hộp thư sale khi có lead mới.
- *Lưu ý:* email có thể chậm vài chục giây / rơi vào tab Quảng cáo. Để sẵn điểm cắm **Telegram bot** cho nhu cầu "nhận tức thì" sau này.

### Mô hình dữ liệu Lead (mini-CRM)
```
Lead {
  name, phone, email?
  source         // "calculator" | "survey" | "quote" | "zalo"
  productId?     // SP quan tâm
  area?          // m² đã nhập
  estimatedCost? // số tạm tính
  message?
  status         // "new" | "contacted" | "quoted" | "won" | "lost"
  createdAt
}
```
→ Sale vào `/admin` xem danh sách lead, cập nhật trạng thái → **mini-CRM miễn phí** ngay trong Payload.

---

## 5. Mô hình dữ liệu (Payload Collections)

```
Products        name, slug, collectionRef, thickness, pricePerM2,
                waterproof, color, surface, roomTypes[], images[],
                specs (mô tả kỹ thuật), description, seoMeta

Collections     name, slug, description, coverImage, seoMeta
                (bộ sưu tập theo concept/phòng)

Articles        title, slug, excerpt, body (rich text), coverImage,
                tags[], seoMeta, publishedAt           (bài viết blog)

Projects        title, slug, images[], description, productRefs[]
                (công trình thực tế đã thi công)

Leads           (như mục 4 — mini-CRM)

Settings        installPricePerM2, trimEstimate, contactInfo (NAP),
                showroomAddress, mapEmbed, zaloOA, businessHours
                (global config, cấu hình giá & thông tin liên hệ)
```

---

## 6. Chiến lược SEO (kênh kéo khách miễn phí #1)

### Tầng 1 — SEO kỹ thuật (Next.js)
- SSG/ISR → tải nhanh, index dễ.
- Meta tags + Open Graph động cho từng SP & bài viết.
- **Schema.org structured data:** `Product` (giá/tình trạng), `LocalBusiness` (showroom + map + giờ mở cửa), `Article`, `BreadcrumbList`, `FAQPage`.
- `sitemap.xml` + `robots.txt` tự sinh.
- Core Web Vitals: `next/image`, lazy-load.

### Tầng 2 — Local SEO (đánh chiếm HN)
- Google Business Profile + Maps (showroom).
- Trang tối ưu từ khoá địa phương: "sàn gỗ Hà Nội", "showroom sàn gỗ [quận]"...
- **NAP** (Name-Address-Phone) đồng nhất toàn web.
- Khuyến khích khách đánh giá Google → tăng thứ hạng local.

### Tầng 3 — Content SEO (dài hạn)
Đánh theo search intent:
- **Tìm hiểu:** "sàn gỗ công nghiệp loại nào tốt", "sàn gỗ 8mm hay 12mm".
- **Mua:** "giá sàn gỗ 1m2 bao nhiêu", "báo giá sàn gỗ trọn gói Hà Nội".
- **Thương hiệu:** "sàn gỗ FUKIONE có tốt không".

Mỗi bài cài CTA "Tính chi phí"/"Nhận báo giá" → biến đọc giả thành lead.

> **Lưu ý content:** hiện chỉ có ảnh. Việc sản xuất nội dung (specs 52 mã + bài blog) là **luồng công việc song song**, bổ sung dần qua CMS (Payload hỗ trợ thêm bài bất cứ lúc nào, không cần đụng code). Code chừa sẵn chỗ.

---

## 7. Chất lượng & Phi chức năng

### Xử lý lỗi & độ tin cậy
- Form validation (Zod) ở cả client + server.
- **Lead không bao giờ mất:** lưu DB trước, gửi email là bước sau (tách biệt, có retry).
- Anti-spam: honeypot + rate-limit.
- Trang 404/500 thân thiện, có lối quay về catalog.
- Ảnh lỗi → placeholder, không vỡ layout.

### Kiểm thử (vừa đủ)
- **Unit:** logic máy tính chi phí (quan trọng nhất — tính sai là mất uy tín).
- **Integration:** submit form → tạo lead → gửi email.
- **E2E (Playwright):** 2 luồng vàng — "tính chi phí → để lại lead" & "lọc SP → xem chi tiết".
- **Lighthouse CI:** gác cổng điểm SEO/Performance mỗi lần deploy.

### Bảo mật
- Secrets trong `.env`, không hardcode.
- Admin Payload sau auth.
- HTTPS mặc định (Vercel).
- Rate-limit API form.

---

## 8. Lộ trình triển khai (Phase 1)

| Giai đoạn | Nội dung | Ước tính |
|---|---|---|
| **M1 — Nền tảng** | Setup Next.js + Payload + Postgres + deploy Vercel; schema Products & Leads | ~1 tuần |
| **M2 — Catalog** | Trang chủ, danh mục + bộ lọc, chi tiết SP, import 52 mã | ~1.5 tuần |
| **M3 — Chốt lead** | Máy tính chi phí, các form, email noti (Resend), mini-CRM admin | ~1.5 tuần |
| **M4 — SEO & Trust** | Schema.org, sitemap, Maps, trang dự án/blog/giới thiệu | ~1 tuần |
| **M5 — Hoàn thiện** | Test, Lighthouse, Zalo widget, GA4, go-live | ~1 tuần |

→ Tổng **~6 tuần** code (part-time thì giãn ra). Content viết song song.

---

## 9. Chi phí vận hành (giai đoạn đầu)

| Khoản | Chi phí |
|---|---|
| Vercel (Hobby) | $0 |
| PostgreSQL (Neon/Supabase free tier) | $0 |
| Resend (email) | $0 (3k mail/tháng) |
| Tên miền `.vn`/`.com` | ~0.8–1.5tr/năm |
| Lưu trữ ảnh (Cloudinary/Vercel free tier) | $0 |
| **Tổng khởi đầu** | **≈ chỉ tiền tên miền** |

Chỉ nâng cấp (Vercel Pro $20, DB trả phí...) khi traffic thực sự lớn → **không tốn tiền hạ tầng cho tới khi web đã có khách thật**.

---

## 10. Phạm vi — Có & Không (Phase 1)

### CÓ trong Phase 1
- Website B2C lead-gen tại HN, 52 mã SP có bộ lọc.
- Máy tính chi phí, các form thu lead, email noti, mini-CRM trong admin.
- SEO kỹ thuật + Local SEO + cấu trúc cho content SEO.
- Zalo widget, GA4, Google Maps/Business Profile.

### KHÔNG trong Phase 1 (YAGNI)
- ❌ Giỏ hàng + cổng thanh toán online (chưa cần — bán qua tư vấn).
- ❌ Quản lý tồn kho realtime.
- ❌ Dealer Portal B2B (Phase 2).
- ❌ AR visualizer, đặt lịch showroom online (Phase 3).
- ❌ Spring Boot service (bổ sung đúng lúc ở Phase 2).
- ❌ Ship đi tỉnh (Phase 1 chỉ HN).
- ❌ Đa ngôn ngữ.

---

## 11. Quyết định kiến trúc & lý do (tóm tắt)

| Quyết định | Lý do |
|---|---|
| Lead-gen thay vì TMĐT đầy đủ | Sàn gỗ bán qua tư vấn; tiết kiệm chi phí & thời gian xây giỏ hàng/thanh toán |
| Next.js + Payload (không WordPress) | SEO mạnh, tận dụng React, làm chủ code & data |
| Payload + Postgres (không Sanity) | Sở hữu data, liền mạch Spring Boot Phase 2 |
| Hoãn Spring Boot tới Phase 2 | Tránh phí hạ tầng & 2 codebase khi chưa cần |
| Chỉ HN, không ship tỉnh (Phase 1) | Logistics gọn, tận dụng năng lực thực tế |
| Tên + SĐT bắt buộc, email optional | Form ngắn → nhiều lead hơn |
| Email noti (chừa chỗ Telegram) | Đủ dùng giai đoạn đầu, nâng cấp dễ |
```
