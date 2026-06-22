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
