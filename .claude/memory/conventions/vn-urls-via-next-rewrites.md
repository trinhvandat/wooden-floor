---
name: vn-urls-via-next-rewrites
description: Vietnamese public URLs are next.config.ts rewrites onto English route folders — already wired; don't rename folders
metadata: { type: convention, date: 2026-06-22 }
---
The reconciliation between "code/route folders in English" and "public URLs in
Vietnamese-no-accent (SEO gotcha)" is **already solved** by `fukione-web/next.config.ts`
`rewrites()`. Route folders stay English (`app/products`, `app/quote`, `app/book-survey`,
`app/thank-you`); the rewrites map the Vietnamese URL a visitor sees onto the English route
that renders it:
`/san-pham → /products`, `/san-pham/:slug → /products/:slug`, `/bao-gia → /quote`,
`/dat-lich-khao-sat → /book-survey`, `/cam-on → /thank-you`. Internal `<Link href>` and
form `router.push` use the **Vietnamese** (public) URLs, so the address bar always shows
Vietnamese.

**Why:** A rewrite (not a redirect) keeps the Vietnamese URL canonical for local SEO while
the codebase stays English. Forms already `router.push("/cam-on")` — that works because of
the rewrite, it is NOT a 404. Don't "fix" it, and don't rename the English folders.

**How to apply:** Add a new public page = create the English route folder + add one rewrite
line + link to the Vietnamese path. Related: [[english-only-artifacts]],
[[0008-lead-funnel-route-handler]].
