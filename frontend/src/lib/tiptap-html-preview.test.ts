import { describe, it, expect } from 'vitest';
import {
  tiptapHtmlToPreviewBlocks,
  truncatePreviewBlocks,
} from './tiptap-html-preview';

describe('tiptapHtmlToPreviewBlocks', () => {
  it('ayrı başlık ve paragraf üretir (yapışık metin olmaz)', () => {
    const html =
      '<h2>Başlık</h2><p>İlk paragraf.</p><p>İkinci satır<br>satır sonu</p>';
    const blocks = tiptapHtmlToPreviewBlocks(html);
    expect(blocks[0]).toEqual({ kind: 'heading', text: 'Başlık' });
    expect(blocks[1]).toEqual({ kind: 'paragraph', text: 'İlk paragraf.' });
    expect(blocks[2]?.kind).toBe('paragraph');
    expect(blocks[2]?.text).toContain('İkinci satır');
    expect(blocks[2]?.text).toContain('satır sonu');
  });

  it('liste maddelerini işaretler', () => {
    const html = '<ul><li>bir</li><li>iki</li></ul>';
    const blocks = tiptapHtmlToPreviewBlocks(html);
    expect(blocks.some((b) => b.text.includes('• bir'))).toBe(true);
  });
});

describe('truncatePreviewBlocks', () => {
  it('karakter sınırında keser', () => {
    const blocks = truncatePreviewBlocks([{ kind: 'paragraph', text: 'ABCDEFGH' }], 4);
    expect(blocks.length).toBe(1);
    expect(blocks[0]?.text).toBe('ABC…');
  });
});
