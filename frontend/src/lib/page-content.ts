/** HTML içeriğinde okunabilir metin var mı (boş `<p></p>`, `&nbsp;` vb. sayılmaz). */
export function pageHasWrittenContent(html: string | undefined | null): boolean {
  if (!html || !String(html).trim()) return false;
  const text = String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 0;
}
