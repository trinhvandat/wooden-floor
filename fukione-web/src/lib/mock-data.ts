// Mock data for development — no database yet (Payload/Postgres is a later milestone)
// 8 products spanning all filter dimensions: thicknessMm (8|12), waterproof (true|false),
// varied color and roomTypes so catalog filters have real data to work with.

import type { Collection, Product, Project, RichTextContent } from "./types";

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const PRODUCTS: Product[] = [
  // ── F8-12mm: brief-specified, 12 mm, waterproof ─────────────────────────
  {
    id: "p1",
    slug: "san-go-f8-12mm",
    name: "Sàn Gỗ F8-12mm",
    pricePerM2: 450_000,
    thicknessMm: 12,
    waterproof: true,
    color: "Nâu Sáng",
    surface: "Vân gỗ tự nhiên",
    roomTypes: ["phòng khách", "phòng ngủ"],
    images: [],
    specs: [
      { k: "Độ dày", v: "12 mm" },
      { k: "Kháng nước", v: "Có" },
      { k: "Bề mặt", v: "AC4" },
    ],
  },

  // ── O-Sồi: brief-specified, 8 mm, not waterproof ────────────────────────
  {
    id: "p2",
    slug: "san-go-o-soi",
    name: "Sàn Gỗ O-Sồi",
    pricePerM2: 520_000,
    thicknessMm: 8,
    waterproof: false,
    color: "Vàng Sồi",
    surface: "Bề mặt mờ",
    roomTypes: ["phòng ngủ", "phòng làm việc"],
    images: [],
    specs: [
      { k: "Độ dày", v: "8 mm" },
      { k: "Kháng nước", v: "Không" },
      { k: "Bề mặt", v: "AC3" },
    ],
  },

  // ── Walnut: brief-specified, 12 mm, waterproof ───────────────────────────
  {
    id: "p3",
    slug: "san-go-walnut",
    name: "Sàn Gỗ Walnut",
    pricePerM2: 610_000,
    thicknessMm: 12,
    waterproof: true,
    color: "Nâu Đậm",
    surface: "Vân gỗ óc chó",
    roomTypes: ["phòng khách", "phòng ăn"],
    images: [],
    specs: [
      { k: "Độ dày", v: "12 mm" },
      { k: "Kháng nước", v: "Có" },
      { k: "Bề mặt", v: "AC4" },
    ],
  },

  // ── Thêm 5 sản phẩm phủ đủ bộ lọc ──────────────────────────────────────

  // 8mm + waterproof + phòng bếp
  {
    id: "p4",
    slug: "san-go-tre-em-8mm",
    name: "Sàn Gỗ Trẻ Em 8mm",
    pricePerM2: 380_000,
    thicknessMm: 8,
    waterproof: true,
    color: "Trắng Kem",
    surface: "Chống trơn trượt",
    roomTypes: ["phòng trẻ em", "phòng ngủ"],
    images: [],
    specs: [
      { k: "Độ dày", v: "8 mm" },
      { k: "Kháng nước", v: "Có" },
      { k: "Bề mặt", v: "AC3" },
    ],
  },

  // 12mm + not waterproof + phòng làm việc
  {
    id: "p5",
    slug: "san-go-cherry-12mm",
    name: "Sàn Gỗ Cherry 12mm",
    pricePerM2: 490_000,
    thicknessMm: 12,
    waterproof: false,
    color: "Đỏ Anh Đào",
    surface: "Bề mặt bóng",
    roomTypes: ["phòng làm việc", "phòng khách"],
    images: [],
    specs: [
      { k: "Độ dày", v: "12 mm" },
      { k: "Kháng nước", v: "Không" },
      { k: "Bề mặt", v: "AC4" },
    ],
  },

  // 8mm + not waterproof + phòng ăn
  {
    id: "p6",
    slug: "san-go-maple-8mm",
    name: "Sàn Gỗ Maple 8mm",
    pricePerM2: 420_000,
    thicknessMm: 8,
    waterproof: false,
    color: "Vàng Nhạt",
    surface: "Vân gỗ mịn",
    roomTypes: ["phòng ăn", "hành lang"],
    images: [],
    specs: [
      { k: "Độ dày", v: "8 mm" },
      { k: "Kháng nước", v: "Không" },
      { k: "Bề mặt", v: "AC3" },
    ],
  },

  // 12mm + waterproof + hành lang / bếp
  {
    id: "p7",
    slug: "san-go-xam-bac-12mm",
    name: "Sàn Gỗ Xám Bạc 12mm",
    pricePerM2: 560_000,
    thicknessMm: 12,
    waterproof: true,
    color: "Xám Bạc",
    surface: "Vân bê tông hiện đại",
    roomTypes: ["hành lang", "bếp", "phòng khách"],
    images: [],
    specs: [
      { k: "Độ dày", v: "12 mm" },
      { k: "Kháng nước", v: "Có" },
      { k: "Bề mặt", v: "AC5" },
    ],
  },

  // 8mm + waterproof + bếp / hành lang
  {
    id: "p8",
    slug: "san-go-nau-den-8mm",
    name: "Sàn Gỗ Nâu Đen 8mm",
    pricePerM2: 460_000,
    thicknessMm: 8,
    waterproof: true,
    color: "Nâu Đen",
    surface: "Vân gỗ đậm",
    roomTypes: ["bếp", "phòng ăn", "hành lang"],
    images: [],
    specs: [
      { k: "Độ dày", v: "8 mm" },
      { k: "Kháng nước", v: "Có" },
      { k: "Bề mặt", v: "AC4" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export const COLLECTIONS: Collection[] = [
  {
    id: "c1",
    slug: "bo-suu-tap-cao-cap",
    name: "Bộ Sưu Tập Cao Cấp",
    description:
      "Dòng sản phẩm sàn gỗ cao cấp, kháng nước vượt trội cho không gian sang trọng.",
    coverImage: "/images/collections/cao-cap.jpg",
    productIds: ["p3", "p7", "p5"],
  },
  {
    id: "c2",
    slug: "bo-suu-tap-gia-dinh",
    name: "Bộ Sưu Tập Gia Đình",
    description:
      "Sàn gỗ bền đẹp, an toàn cho mọi thành viên trong gia đình, kể cả trẻ nhỏ.",
    coverImage: "/images/collections/gia-dinh.jpg",
    productIds: ["p1", "p2", "p4", "p6", "p8"],
  },
];

// ---------------------------------------------------------------------------
// Projects (showroom / công trình thực tế)
// ---------------------------------------------------------------------------

export const PROJECTS: Project[] = [
  {
    id: "j1",
    slug: "can-ho-vinhomes-ocean-park",
    title: "Căn Hộ Vinhomes Ocean Park",
    description:
      "Lắp đặt sàn gỗ trọn gói cho căn hộ 85m² tại Vinhomes Ocean Park, Gia Lâm.",
    location: "Gia Lâm, Hà Nội",
    areaM2: 85,
    productIds: ["p3", "p7"],
    images: [],
  },
  {
    id: "j2",
    slug: "villa-ecopark",
    title: "Villa Ecopark",
    description: "Thi công sàn gỗ cao cấp cho villa 220m² tại Ecopark, Văn Giang.",
    location: "Văn Giang, Hưng Yên",
    areaM2: 220,
    productIds: ["p7"],
    images: [],
  },
  {
    id: "j3",
    slug: "nha-pho-times-city",
    title: "Nhà Phố Times City",
    description: "Sàn gỗ chống nước cho nhà phố 120m² tại Times City, Hai Bà Trưng.",
    location: "Hai Bà Trưng, Hà Nội",
    areaM2: 120,
    productIds: ["p3"],
    images: [],
  },
  {
    id: "j4",
    slug: "can-ho-royal-city",
    title: "Căn Hộ Royal City",
    description: "Lắp đặt sàn gỗ phòng khách + phòng ngủ cho căn hộ 95m² tại Royal City.",
    location: "Thanh Xuân, Hà Nội",
    areaM2: 95,
    productIds: [],
    images: [],
  },
];

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

function lexicalBody(heading: string, paragraphs: string[]): RichTextContent {
  const text = (t: string) => ({
    type: "text", text: t, detail: 0, format: 0, mode: "normal", style: "", version: 1,
  });
  return {
    root: {
      type: "root",
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
      children: [
        { type: "heading", tag: "h2", direction: "ltr", format: "", indent: 0, version: 1, children: [text(heading)] },
        ...paragraphs.map((p) => ({
          type: "paragraph", direction: "ltr", format: "", indent: 0, version: 1, textFormat: 0, children: [text(p)],
        })),
      ],
    },
  };
}

export interface MockArticle {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
  body: RichTextContent;
}

export const ARTICLES: MockArticle[] = [
  {
    slug: "chon-san-go-chong-nuoc",
    title: "Cách chọn sàn gỗ chống nước cho căn hộ",
    excerpt: "Tiêu chí chọn sàn gỗ chống nước bền đẹp cho phòng khách và bếp.",
    tags: ["chống nước", "kinh nghiệm"],
    publishedAt: "2026-06-10T00:00:00.000Z",
    body: lexicalBody("Vì sao nên chọn sàn gỗ chống nước", [
      "Sàn gỗ chống nước phù hợp với khí hậu ẩm của Hà Nội, hạn chế cong vênh.",
      "Hãy ưu tiên cốt gỗ HDF lõi xanh và lớp phủ chống xước cho khu vực đi lại nhiều.",
    ]),
  },
  {
    slug: "bao-duong-san-go-dung-cach",
    title: "Bảo dưỡng sàn gỗ đúng cách",
    excerpt: "Những lưu ý đơn giản giúp sàn gỗ bền màu theo năm tháng.",
    tags: ["bảo dưỡng", "mẹo"],
    publishedAt: "2026-06-05T00:00:00.000Z",
    body: lexicalBody("Bảo dưỡng sàn gỗ tại nhà", [
      "Lau sàn bằng khăn ẩm vắt khô, tránh đổ nước trực tiếp lên bề mặt.",
      "Dùng chân đế nỉ cho bàn ghế để tránh trầy xước khi di chuyển.",
    ]),
  },
  {
    slug: "san-go-cho-phong-ngu",
    title: "Chọn màu sàn gỗ cho phòng ngủ ấm cúng",
    excerpt: "Gợi ý phối màu sàn gỗ giúp phòng ngủ ấm áp, thư giãn.",
    tags: ["phối màu", "phòng ngủ"],
    publishedAt: "2026-05-28T00:00:00.000Z",
    body: lexicalBody("Phối màu sàn gỗ cho phòng ngủ", [
      "Tông nâu ấm và vân gỗ tự nhiên tạo cảm giác gần gũi cho không gian nghỉ ngơi.",
      "Kết hợp sàn màu trung tính với nội thất sáng để phòng ngủ rộng và thoáng hơn.",
    ]),
  },
];
