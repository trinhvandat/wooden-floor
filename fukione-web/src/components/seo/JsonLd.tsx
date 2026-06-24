// Renders a JSON-LD <script>. `data` is always server-built from trusted
// sources (Settings, DB products), so dangerouslySetInnerHTML is safe here.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
