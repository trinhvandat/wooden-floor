// Renders a JSON-LD <script>. `data` is always server-built from trusted
// sources (Settings, DB products), so dangerouslySetInnerHTML is safe here.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
