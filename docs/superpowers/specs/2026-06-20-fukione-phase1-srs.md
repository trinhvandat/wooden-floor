# SRS — Website Bán Lẻ Sàn Gỗ FUKIONE (Phase 1)

**Tài liệu:** Software Requirements Specification (SRS)
**Phiên bản:** 1.0
**Ngày:** 2026-06-20
**Phạm vi:** Phase 1 — Website B2C lead-gen tại Hà Nội
**Tài liệu liên quan:** `2026-06-20-fukione-wooden-floor-ecommerce-design.md`

---

## 1. Giới thiệu

### 1.1 Mục đích
Tài liệu này đặc tả đầy đủ **yêu cầu chức năng** và **yêu cầu phi chức năng** cho Phase 1 của website bán lẻ sàn gỗ FUKIONE. Đây là cơ sở để lập kế hoạch triển khai, viết test, và nghiệm thu.

### 1.2 Phạm vi sản phẩm
Website B2C theo mô hình **lead-gen-first**: thu hút khách qua SEO/Local SEO, tạo niềm tin, cung cấp công cụ ước tính chi phí, và thu thập lead để đội sale chốt đơn qua tư vấn. KHÔNG bao gồm giỏ hàng/thanh toán online, tồn kho realtime, B2B portal, ship đi tỉnh (xem §2.5 và Design Doc §10).

### 1.3 Định nghĩa & thuật ngữ
| Thuật ngữ | Ý nghĩa |
|---|---|
| **Lead** | Thông tin khách tiềm năng (tên, SĐT, nhu cầu) thu được qua form/calculator |
| **CMS** | Payload 3 — hệ quản trị nội dung, kèm admin & API |
| **SSG/ISR** | Static Site Generation / Incremental Static Regeneration (Next.js) |
| **NAP** | Name–Address–Phone (đồng nhất phục vụ Local SEO) |
| **AOV** | Average Order Value — giá trị đơn trung bình |
| **CTA** | Call To Action — nút/khu vực kêu gọi hành động |
| **NFR / FR** | Non-Functional / Functional Requirement |

### 1.4 Ký hiệu yêu cầu & độ ưu tiên
- Mã chức năng: **FR-<Module>-<số>**; mã phi chức năng: **NFR-<Loại>-<số>**.
- Độ ưu tiên theo **MoSCoW**: **M** (Must), **S** (Should), **C** (Could). Phase 1 chỉ chứa M/S; mục C ghi để tham chiếu, có thể trượt sang sau.

---

## 2. Mô tả tổng quan

### 2.1 Bối cảnh
Sản phẩm là website mới, độc lập, không tích hợp hệ thống nội bộ nào ở Phase 1. Dữ liệu nằm trong PostgreSQL do FUKIONE sở hữu, sẵn sàng cho Spring Boot service ở Phase 2.

### 2.2 Nhóm người dùng
| Vai trò | Mô tả | Nhu cầu chính |
|---|---|---|
| **Khách tham quan (Visitor)** | Người tiêu dùng HN đang tìm/đắn đo mua sàn gỗ | Xem SP, ước tính chi phí, được tư vấn |
| **Khách để lại lead (Lead)** | Visitor đã gửi form/calculator | Được sale liên hệ nhanh |
| **Sale / CSKH** | Nhân viên FUKIONE | Nhận lead, quản lý trạng thái, chốt đơn |
| **Quản trị nội dung (Editor)** | FUKIONE / người được giao | Thêm/sửa SP, bài viết, dự án, cấu hình giá |
| **Quản trị viên (Admin)** | Chủ/kỹ thuật | Toàn quyền hệ thống, cấu hình tích hợp |

### 2.3 Tổng quan chức năng (module)
1. **Catalog** — duyệt, lọc, tìm kiếm, xem chi tiết sản phẩm
2. **Cost Calculator** — máy tính ước tính chi phí trọn gói
3. **Lead Capture** — các form & cửa thu lead
4. **Content & Trust** — blog, dự án, bộ sưu tập, giới thiệu, liên hệ
5. **SEO** — kỹ thuật + local + cấu trúc content
6. **CMS/Admin** — quản trị nội dung + mini-CRM lead
7. **Notification** — email báo lead
8. **Integration** — Zalo, GA4, Google Maps/Business Profile

### 2.4 Ràng buộc
- **Khu vực:** chỉ phục vụ Hà Nội (Phase 1).
- **Content:** hiện chỉ có ảnh; specs/mô tả/bài viết bổ sung dần qua CMS.
- **Chi phí hạ tầng:** ưu tiên free tier (Vercel, Neon/Supabase, Resend).
- **Ngôn ngữ:** tiếng Việt (đơn ngữ).
- **Người triển khai:** mạnh Java/Spring, biết React; kiến trúc phải tiến hoá được sang Phase 2 (Spring Boot dùng chung Postgres).

### 2.5 Giả định & phụ thuộc
- Có showroom vật lý tại HN (lên Google Maps/Business Profile).
- Có tài khoản Zalo OA, domain, Resend, Vercel, DB provider.
- Đơn giá lắp đặt/phào nẹp do FUKIONE cung cấp & cấu hình trong admin.
- Đội sale phản hồi lead trong giờ làm việc.

---

## 3. Yêu cầu chức năng (Functional Requirements)

### 3.1 Module Catalog (FR-CAT)

| Mã | Ưu tiên | Yêu cầu |
|---|---|---|
| **FR-CAT-01** | M | Trang danh mục `/san-pham` hiển thị toàn bộ 52 mã SP dạng lưới (ảnh, tên, giá/m², nhãn đặc tính nổi bật). |
| **FR-CAT-02** | M | Bộ lọc đa tiêu chí: **màu sắc, độ dày, khả năng chống nước, khoảng giá, loại phòng phù hợp**. Cho phép chọn nhiều giá trị; kết quả cập nhật không tải lại trang. |
| **FR-CAT-03** | M | Trạng thái bộ lọc phản ánh vào URL (query params) để chia sẻ & SEO; tải lại trang giữ nguyên bộ lọc. |
| **FR-CAT-04** | S | Sắp xếp kết quả: giá tăng/giảm, mới nhất, nổi bật. |
| **FR-CAT-05** | M | Trang chi tiết `/san-pham/[slug]`: gallery ảnh lớn (zoom), bảng thông số kỹ thuật, mô tả, giá/m², các nhãn đặc tính. |
| **FR-CAT-06** | M | Trang chi tiết nhúng widget **"Tính chi phí"** (FR-CALC) đã chọn sẵn SP hiện tại. |
| **FR-CAT-07** | M | Trang chi tiết có CTA: "Nhận báo giá", "Đặt lịch khảo sát", và nút Zalo. |
| **FR-CAT-08** | S | Khối "Sản phẩm liên quan/cùng bộ sưu tập" ở cuối trang chi tiết. |
| **FR-CAT-09** | S | Tìm kiếm SP theo từ khoá (tên/đặc tính). |
| **FR-CAT-10** | M | Khi không có kết quả lọc → thông báo thân thiện + gợi ý gỡ bớt bộ lọc. |

### 3.2 Module Cost Calculator (FR-CALC)

| Mã | Ưu tiên | Yêu cầu |
|---|---|---|
| **FR-CALC-01** | M | Người dùng nhập **diện tích (m²)**, chọn **sản phẩm**, chọn **có/không lắp đặt**. |
| **FR-CALC-02** | M | Hệ thống tính & hiển thị tách dòng: **vật liệu** (m² × giá/m²), **lắp đặt** (m² × đơn giá lắp), **phào nẹp** (ước tính), **tạm tính tổng**. |
| **FR-CALC-03** | M | Luôn hiển thị ghi chú "Giá cuối phụ thuộc khảo sát thực tế". |
| **FR-CALC-04** | M | Đơn giá lắp đặt & hệ số phào nẹp lấy từ collection **Settings** (cấu hình trong admin, không hardcode). |
| **FR-CALC-05** | M | Nút **"Nhận báo giá chính xác"** → mở form lead, **tự đính kèm** sản phẩm, diện tích, số tạm tính vào lead. |
| **FR-CALC-06** | M | Validate đầu vào: diện tích là số dương hợp lý (vd 1–10.000 m²); chặn ký tự sai. |
| **FR-CALC-07** | S | Kết quả tính hiển thị tức thì khi đổi input (không cần bấm nút tính). |

### 3.3 Module Lead Capture (FR-LEAD)

| Mã | Ưu tiên | Yêu cầu |
|---|---|---|
| **FR-LEAD-01** | M | Form thu lead với trường **Tên (bắt buộc)**, **SĐT (bắt buộc)**, **Email (tuỳ chọn)**, **Ghi chú (tuỳ chọn)**. |
| **FR-LEAD-02** | M | Mỗi lead ghi nhận **nguồn** (`calculator` / `survey` / `quote` / `zalo`) và các trường ngữ cảnh (productId, area, estimatedCost, message) khi có. |
| **FR-LEAD-03** | M | Form **"Đặt lịch khảo sát"** `/dat-lich-khao-sat`: thêm trường **địa chỉ/khu vực** và **thời gian mong muốn** (tuỳ chọn). |
| **FR-LEAD-04** | M | Form **"Báo giá nhanh"** `/bao-gia`: form ngắn (Tên + SĐT + nhu cầu). |
| **FR-LEAD-05** | M | Validate SĐT theo định dạng VN ở **cả client & server**; báo lỗi rõ ràng tại trường. |
| **FR-LEAD-06** | M | Khi gửi thành công → hiển thị **màn hình/thông điệp cảm ơn**, kèm cam kết thời gian liên hệ. |
| **FR-LEAD-07** | M | Lead được **lưu vào DB trước**, việc gửi email noti là bước tách biệt phía sau (không làm mất lead nếu email lỗi — xem NFR-REL). |
| **FR-LEAD-08** | M | **Chống spam:** honeypot field + rate-limit theo IP/phiên. |
| **FR-LEAD-09** | C | Tuỳ chọn gửi xác nhận cho khách qua email khi khách có nhập email. |

### 3.4 Module Content & Trust (FR-CONT)

| Mã | Ưu tiên | Yêu cầu |
|---|---|---|
| **FR-CONT-01** | M | Trang chủ `/`: hero, USP/cam kết, SP nổi bật, khối dự án tiêu biểu, CTA tư vấn, thông tin showroom. |
| **FR-CONT-02** | M | Trang **Dự án** `/du-an`: gallery công trình thực tế (ảnh + mô tả ngắn), liên kết SP đã dùng nếu có. |
| **FR-CONT-03** | M | **Blog** `/blog` (danh sách) + `/blog/[slug]` (chi tiết, rich text, ảnh, ngày đăng), mỗi bài có CTA thu lead. |
| **FR-CONT-04** | S | **Bộ sưu tập** `/bo-suu-tap/[slug]`: nhóm SP theo concept/phòng. |
| **FR-CONT-05** | M | Trang **Giới thiệu** `/ve-chung-toi` và **Liên hệ** `/lien-he` (NAP, giờ mở cửa, Google Maps nhúng, nút Zalo/gọi). |
| **FR-CONT-06** | M | Header/Footer nhất quán: điều hướng chính, SĐT/Zalo luôn hiện, thông tin showroom ở footer. |
| **FR-CONT-07** | S | Khối FAQ (câu hỏi thường gặp) ở trang chủ hoặc trang SP, gắn schema FAQ. |

### 3.5 Module SEO (FR-SEO)

| Mã | Ưu tiên | Yêu cầu |
|---|---|---|
| **FR-SEO-01** | M | Mỗi trang SP/bài viết/dự án có **meta title, description, Open Graph** động (cấu hình được hoặc tự sinh từ nội dung). |
| **FR-SEO-02** | M | **Structured data Schema.org**: `Product`, `LocalBusiness`, `Article`, `BreadcrumbList`, `FAQPage` ở các trang tương ứng. |
| **FR-SEO-03** | M | Tự sinh **`sitemap.xml`** và **`robots.txt`**, cập nhật khi thêm/sửa nội dung. |
| **FR-SEO-04** | M | URL **tiếng Việt không dấu, slug thân thiện**; canonical URL đúng. |
| **FR-SEO-05** | M | NAP đồng nhất toàn site; nhúng Google Maps + liên kết Google Business Profile. |
| **FR-SEO-06** | S | Breadcrumb hiển thị trên trang chi tiết SP, bài viết, dự án. |

### 3.6 Module CMS / Admin (FR-CMS)

| Mã | Ưu tiên | Yêu cầu |
|---|---|---|
| **FR-CMS-01** | M | Admin Payload `/admin` cho phép CRUD **Products** (mọi trường ở §4), upload nhiều ảnh. |
| **FR-CMS-02** | M | CRUD **Articles**, **Projects**, **Collections** qua admin, không cần đụng code. |
| **FR-CMS-03** | M | Collection **Settings** (global) để cấu hình: đơn giá lắp đặt/m², hệ số phào nẹp, NAP, địa chỉ/giờ showroom, mã nhúng map, Zalo OA. |
| **FR-CMS-04** | M | Collection **Leads** dạng **mini-CRM**: xem danh sách, lọc theo trạng thái/nguồn/thời gian, cập nhật **status** (`new`→`contacted`→`quoted`→`won`/`lost`), thêm ghi chú. |
| **FR-CMS-05** | M | **Xác thực** truy cập admin; phân quyền theo vai trò (Admin toàn quyền, Editor giới hạn nội dung). |
| **FR-CMS-06** | S | Thao tác publish/draft cho bài viết & sản phẩm (nội dung nháp chưa hiện ra ngoài). |
| **FR-CMS-07** | C | Xuất danh sách lead ra CSV. |

### 3.7 Module Notification (FR-NOTI)

| Mã | Ưu tiên | Yêu cầu |
|---|---|---|
| **FR-NOTI-01** | M | Khi có lead mới → gửi **email** tới hộp thư sale, nội dung gồm đầy đủ thông tin lead (tên, SĐT, nguồn, SP, diện tích, tạm tính, ghi chú). |
| **FR-NOTI-02** | M | Gửi email qua **Resend**; cấu hình địa chỉ nhận trong env/Settings. |
| **FR-NOTI-03** | M | Nếu gửi email **thất bại**, hệ thống ghi log lỗi và **retry**; lead vẫn được lưu (không phụ thuộc email). |
| **FR-NOTI-04** | C | Điểm mở rộng (interface) sẵn sàng cắm **Telegram bot** cho thông báo tức thì về sau. |

### 3.8 Module Integration (FR-INT)

| Mã | Ưu tiên | Yêu cầu |
|---|---|---|
| **FR-INT-01** | M | Nhúng **Zalo OA chat widget** hiển thị trên mọi trang (góc màn hình). |
| **FR-INT-02** | M | Tích hợp **Google Analytics 4**: theo dõi pageview & **sự kiện chuyển đổi** (submit lead, dùng calculator, click Zalo). |
| **FR-INT-03** | M | Kết nối **Google Search Console** (xác minh domain, nộp sitemap). |
| **FR-INT-04** | M | Nhúng **Google Maps** vị trí showroom ở trang Liên hệ/footer. |
| **FR-INT-05** | C | Facebook Pixel (nếu chạy quảng cáo) — điểm cắm để sau. |

---

## 4. Yêu cầu dữ liệu (tóm tắt collection)

| Collection | Trường chính |
|---|---|
| **Products** | name, slug, collectionRef, thickness, pricePerM2, waterproof, color, surface, roomTypes[], images[], specs, description, seoMeta, status |
| **Collections** | name, slug, description, coverImage, seoMeta |
| **Articles** | title, slug, excerpt, body, coverImage, tags[], seoMeta, publishedAt, status |
| **Projects** | title, slug, images[], description, productRefs[] |
| **Leads** | name, phone, email?, source, productId?, area?, estimatedCost?, message?, address?, preferredTime?, status, createdAt |
| **Settings** (global) | installPricePerM2, trimEstimate, contactInfo(NAP), showroomAddress, businessHours, mapEmbed, zaloOA |

> Bộ thuộc tính SP có thể bổ sung (cốt gỗ HDF, chuẩn chống xước AC, xuất xứ, bảo hành...) theo xác nhận của FUKIONE — schema thiết kế để mở rộng dễ.

---

## 5. Yêu cầu phi chức năng (Non-Functional Requirements)

### 5.1 Hiệu năng (NFR-PERF)
| Mã | Yêu cầu |
|---|---|
| **NFR-PERF-01** | Trang SP & bài viết render bằng **SSG/ISR**; **LCP ≤ 2.5s** trên 4G di động. |
| **NFR-PERF-02** | Điểm **Lighthouse Performance ≥ 90** (mobile) cho trang chủ & trang SP. |
| **NFR-PERF-03** | Đạt ngưỡng **Core Web Vitals "Good"**: LCP ≤ 2.5s, CLS < 0.1, INP < 200ms. |
| **NFR-PERF-04** | Ảnh tối ưu qua `next/image` (lazy-load, định dạng hiện đại, responsive). |
| **NFR-PERF-05** | Kết quả lọc/sắp xếp catalog phản hồi cảm giác **tức thì (< 300ms)** phía client. |

### 5.2 SEO (NFR-SEO)
| Mã | Yêu cầu |
|---|---|
| **NFR-SEO-01** | Mọi trang public **server-render** được để bot Google index đầy đủ nội dung (không phụ thuộc JS chạy mới thấy nội dung chính). |
| **NFR-SEO-02** | Structured data hợp lệ (qua Rich Results Test); không lỗi nghiêm trọng trong Search Console. |
| **NFR-SEO-03** | Điểm **Lighthouse SEO ≥ 95**. |
| **NFR-SEO-04** | Có chiến lược Local SEO (NAP đồng nhất, Google Business Profile) cho thị trường HN. |

### 5.3 Bảo mật (NFR-SEC)
| Mã | Yêu cầu |
|---|---|
| **NFR-SEC-01** | Toàn site phục vụ qua **HTTPS**; tự redirect HTTP→HTTPS. |
| **NFR-SEC-02** | Secrets (DB, Resend, API keys) lưu trong **biến môi trường**, không hardcode, không commit. |
| **NFR-SEC-03** | Admin & API ghi dữ liệu yêu cầu **xác thực**; phân quyền theo vai trò. |
| **NFR-SEC-04** | **Rate-limit** + honeypot cho mọi endpoint nhận form; chống bot/spam. |
| **NFR-SEC-05** | Validate & sanitize mọi input tại **biên server**; chống injection/XSS (rich text được sanitize). |
| **NFR-SEC-06** | Thông báo lỗi không lộ thông tin nhạy cảm (stack trace, query). |

### 5.4 Độ tin cậy (NFR-REL)
| Mã | Yêu cầu |
|---|---|
| **NFR-REL-01** | **Lead không bao giờ mất**: ghi DB là thao tác cốt lõi; gửi email là phụ trợ, lỗi email không ảnh hưởng việc lưu lead. |
| **NFR-REL-02** | Gửi email có cơ chế **retry** và ghi log khi thất bại. |
| **NFR-REL-03** | Lỗi render/ảnh không làm vỡ trang: có fallback (placeholder ảnh, trang 404/500 thân thiện có lối quay lại). |
| **NFR-REL-04** | Uptime mục tiêu **≥ 99%** (dựa trên hạ tầng Vercel + DB managed). |

### 5.5 Khả dụng & UX (NFR-UX)
| Mã | Yêu cầu |
|---|---|
| **NFR-UX-01** | **Mobile-first, responsive** mượt trên điện thoại (đa số khách VN dùng mobile). |
| **NFR-UX-02** | CTA tư vấn/Zalo/gọi luôn dễ thấy ở mọi trang; tối đa **2 cú chạm** để bắt đầu một form lead. |
| **NFR-UX-03** | Form ngắn gọn, lỗi hiển thị inline, rõ ràng bằng tiếng Việt. |
| **NFR-UX-04** | Tuân thủ cơ bản **WCAG 2.1 AA**: tương phản đủ, alt text ảnh, điều hướng bàn phím cho phần tử tương tác. |
| **NFR-UX-05** | Hỗ trợ trình duyệt hiện đại: Chrome, Safari, Edge, Firefox (2 phiên bản gần nhất); Zalo in-app browser. |

### 5.6 Khả năng bảo trì & mở rộng (NFR-MAINT)
| Mã | Yêu cầu |
|---|---|
| **NFR-MAINT-01** | Mã nguồn tổ chức **module hoá, nhiều file nhỏ** (200–400 dòng/file điển hình, ≤ 800), tách biệt rõ trách nhiệm. |
| **NFR-MAINT-02** | TypeScript **strict mode**; logic tính tiền & validate tách thành module thuần, có test riêng. |
| **NFR-MAINT-03** | Schema dữ liệu thiết kế để **thêm thuộc tính SP** mà không phá vỡ dữ liệu hiện có. |
| **NFR-MAINT-04** | Kiến trúc cho phép **Phase 2 Spring Boot** đọc/ghi chung PostgreSQL mà không phải migrate dữ liệu lớn. |
| **NFR-MAINT-05** | Biến cấu hình kinh doanh (giá, NAP, tích hợp) nằm trong **Settings/CMS hoặc env**, không nằm rải rác trong code. |

### 5.7 Khả năng mở rộng quy mô (NFR-SCALE)
| Mã | Yêu cầu |
|---|---|
| **NFR-SCALE-01** | Phục vụ tốt giai đoạn đầu trên **free tier**; chịu được spike traffic nhờ static + CDN của Vercel. |
| **NFR-SCALE-02** | Nâng cấp (Vercel Pro, DB trả phí) chỉ cần khi traffic thật tăng — **không thay đổi kiến trúc**. |

### 5.8 Pháp lý & quyền riêng tư (NFR-LEGAL)
| Mã | Yêu cầu |
|---|---|
| **NFR-LEGAL-01** | Thu thập dữ liệu cá nhân (tên, SĐT, email) tối thiểu, có ghi chú mục đích sử dụng tại form. |
| **NFR-LEGAL-02** | Có trang/khối **Chính sách bảo mật** cơ bản; tuân thủ quy định bảo vệ dữ liệu cá nhân của VN. |
| **NFR-LEGAL-03** | Cookie/analytics minh bạch (thông báo nếu cần theo quy định). |

### 5.9 Khả năng vận hành & đo lường (NFR-OPS)
| Mã | Yêu cầu |
|---|---|
| **NFR-OPS-01** | **GA4** đo được số lead theo nguồn, tỉ lệ chuyển đổi, lượt dùng calculator. |
| **NFR-OPS-02** | **Lighthouse CI** chạy mỗi lần deploy như cổng chất lượng (SEO/Performance). |
| **NFR-OPS-03** | Log lỗi ứng dụng (form, email) truy được khi cần điều tra. |
| **NFR-OPS-04** | Deploy tự động khi push (CI/CD Vercel); rollback dễ. |

---

## 6. Tiêu chí kiểm thử (tham chiếu)

| Loại | Phạm vi tối thiểu |
|---|---|
| **Unit** | Logic máy tính chi phí (FR-CALC), validate SĐT/diện tích |
| **Integration** | Submit form → tạo Lead → trigger email (FR-LEAD-07, FR-NOTI) |
| **E2E (Playwright)** | Luồng vàng 1: calculator → để lại lead. Luồng vàng 2: lọc SP → xem chi tiết |
| **Phi chức năng** | Lighthouse CI (NFR-PERF/SEO), kiểm tra Schema bằng Rich Results Test |

---

## 7. Ma trận ưu tiên (tóm tắt MoSCoW Phase 1)

**Must (lõi để go-live):**
FR-CAT-01/02/03/05/06/07/10, toàn bộ FR-CALC (trừ 07), FR-LEAD-01..08, FR-CONT-01/02/03/05/06, FR-SEO-01..05, FR-CMS-01..05, FR-NOTI-01/02/03, FR-INT-01/02/03/04; toàn bộ NFR nhóm PERF/SEO/SEC/REL/UX cốt lõi.

**Should (nên có, không chặn go-live):**
FR-CAT-04/08/09, FR-CALC-07, FR-CONT-04/07, FR-SEO-06, FR-CMS-06, FR-LEAD-03 nâng cao.

**Could (để sau / Phase tiếp):**
FR-LEAD-09, FR-CMS-07, FR-NOTI-04 (Telegram), FR-INT-05 (FB Pixel).

---

## 8. Ngoài phạm vi Phase 1 (nhắc lại)
Giỏ hàng/thanh toán online, tồn kho realtime, Dealer Portal B2B, AR visualizer, đặt lịch showroom online, Spring Boot service, ship đi tỉnh, đa ngôn ngữ. (Xem Design Doc §10.)
