/**
 * TipTap HTML → önizleme blokları (başlık / paragraf); bloklar arası yapı korunur.
 * DOMParser kullanmıyoruz: SSR ile istemci aynı çıktıyı üretsin (hydration).
 */

export type TipTapPreviewBlock = { kind: 'heading' | 'paragraph'; text: string };

function stripInnerHtml(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .split('\n')
    .map((line) => line.replace(/[ \t\f\v]+/g, ' ').trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * TipTap’in ürettiği yaygın blokları sırayla yakalar (iç içe h1+p için yeterli).
 */
export function tiptapHtmlToPreviewBlocks(html: string): TipTapPreviewBlock[] {
  if (!html?.trim()) return [];

  const blocks: TipTapPreviewBlock[] = [];
  const re =
    /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>|<p[^>]*>([\s\S]*?)<\/p>|<blockquote[^>]*>([\s\S]*?)<\/blockquote>|<li[^>]*>([\s\S]*?)<\/li>/gi;

  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m[1]) {
      const text = stripInnerHtml(m[2] ?? '');
      if (text) blocks.push({ kind: 'heading', text });
    } else if (m[3] !== undefined) {
      const text = stripInnerHtml(m[3]);
      if (text) blocks.push({ kind: 'paragraph', text });
    } else if (m[4] !== undefined) {
      const text = stripInnerHtml(m[4]);
      if (text) blocks.push({ kind: 'paragraph', text });
    } else if (m[5] !== undefined) {
      const text = stripInnerHtml(m[5]);
      if (text) blocks.push({ kind: 'paragraph', text: `• ${text}` });
    }
  }

  if (blocks.length === 0) {
    const text = stripInnerHtml(html.replace(/<[^>]+>/g, ' '));
    if (text) blocks.push({ kind: 'paragraph', text });
  }

  return blocks;
}

export function truncatePreviewBlocks(
  blocks: TipTapPreviewBlock[],
  maxChars: number
): TipTapPreviewBlock[] {
  if (maxChars <= 0 || blocks.length === 0) return [];
  const out: TipTapPreviewBlock[] = [];
  let used = 0;
  for (const b of blocks) {
    if (used >= maxChars) break;
    const remaining = maxChars - used;
    if (b.text.length <= remaining) {
      out.push(b);
      used += b.text.length;
      continue;
    }
    const slice = b.text.slice(0, Math.max(0, remaining - 1)) + '…';
    out.push({ ...b, text: slice });
    break;
  }
  return out;
}
