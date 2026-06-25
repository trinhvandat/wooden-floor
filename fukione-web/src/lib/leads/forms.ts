import { z } from "zod";
import { leadInputSchema } from "./schema";

// Reuse the canonical field validators from the server schema so client-side
// inline errors stay in lock-step with what the API enforces.
const { name, phone, email } = leadInputSchema.shape;

/** Calculator / quote lead form: name + phone required, email optional. */
export const quoteFormSchema = z.object({ name, phone, email });
export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

/** Survey booking form: name + phone + address required. */
export const surveyFormSchema = z.object({
  name,
  phone,
  address: z.string().trim().min(1, "Vui lòng nhập địa chỉ khảo sát").max(300),
});
export type SurveyFormValues = z.infer<typeof surveyFormSchema>;

/** Flatten a failed safeParse into a `{ field: firstMessage }` record. */
export function collectFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in out)) {
      out[key] = issue.message;
    }
  }
  return out;
}

/** Validate one field on blur; returns the first error message or undefined. */
export function validateField(fieldSchema: z.ZodType, value: unknown): string | undefined {
  const result = fieldSchema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}
