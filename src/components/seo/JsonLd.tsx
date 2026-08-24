/**
 * Renders a structured-data block as an inline ld+json script.
 *
 * Server component by design — the payload must be in the initial HTML for
 * crawlers that do not execute JavaScript.
 */

/** Structured data is arbitrary JSON, so an index signature is the honest type. */
type JsonLdData = Record<string, unknown>;

/**
 * `<` is escaped so a string inside the payload can never close the script tag
 * early. The data is authored in-repo, but escaping keeps that guarantee local
 * to this component rather than resting on every caller.
 */
const serialize = (data: JsonLdData): string =>
  JSON.stringify(data).replace(/</g, '\\u003c');

export default function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}
