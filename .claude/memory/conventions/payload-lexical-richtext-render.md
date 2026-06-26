---
name: payload-lexical-richtext-render
description: Render a Payload lexical richText field on public pages with the official RichText React component — no dangerouslySetInnerHTML, no typography dependency
metadata: { type: convention, date: 2026-06-26 }
---
A Payload `richText` field (e.g. `Articles.body`) stores a lexical **editor-state JSON object**
(`{ root: { children: [...] } }`), NOT an HTML string. Render it on public pages with Payload's
official React renderer:

```ts
import { RichText } from "@payloadcms/richtext-lexical/react";
// ...
<RichText data={article.body} className="…tailwind typography…" />
```

- `RichText` renders to **JSX server-side** — no `dangerouslySetInnerHTML`. The `data` prop is the
  lexical editor state; `className` styles the container.
- **Typing:** the prop type is `SerializedEditorState`. A local structural type
  (`RichTextContent = { root: {...}; [k: string]: unknown }` whose `format` union matches lexical's
  `ElementFormatType`) is assignable without a cast — tsc passes. If it ever doesn't, switch the
  alias to `DefaultTypedEditorState` from `@payloadcms/richtext-lexical` (declared in the package's
  `dist/nodeTypes.d.ts`) — never cast to `any`/`never`.
- **No new dependency:** style the rendered elements with Tailwind arbitrary-variant selectors
  (`[&_h2]:… [&_p]:… [&_ul]:list-disc …`) on the `className`, not `@tailwindcss/typography`.
- **Seeding:** a lexical body must be a *valid* editor state or the renderer outputs empty/throws.
  Each node needs its required fields — root/heading/paragraph: `type`, `children`, `direction`,
  `format`, `indent`, `version` (paragraph also `textFormat`); text: `type`, `text`, `detail`,
  `format`, `mode`, `style`, `version`. Build seed bodies with a small helper, don't hand-write.

**Why:** the official renderer handles every node type safely and stays correct across Payload
upgrades, with no XSS surface. **How to apply:** for any public richText field, import `RichText`
from `/react`, pass `data`, style via arbitrary variants, and verify the seeded body renders to real
elements (not a blob) with `pnpm build` + a live check. Related: [[0016-blog-articles]],
[[safe-embed-iframe-validation]].
