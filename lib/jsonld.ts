/** Serialise JSON-LD safely for a <script> tag (escapes `<` so content can't close the tag). */
export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
