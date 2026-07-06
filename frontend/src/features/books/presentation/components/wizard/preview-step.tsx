'use client';

import { useBookEditorStore } from '../../stores/book-editor.store';
import { getWizardSectionPages } from '../../utils/wizard-section-pages';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookOpen, FileText, Eye, EyeOff, Calendar } from 'lucide-react';
import {
  tiptapHtmlToPreviewBlocks,
  truncatePreviewBlocks,
  type TipTapPreviewBlock,
} from '@/lib/tiptap-html-preview';
import { pageHasWrittenContent } from '@/lib/page-content';

const PAGE_SNIPPET_MAX_CHARS = 360;

function PageContentSnippet({ html }: { html: string }) {
  const blocks: TipTapPreviewBlock[] = truncatePreviewBlocks(
    tiptapHtmlToPreviewBlocks(html),
    PAGE_SNIPPET_MAX_CHARS
  );

  if (blocks.length === 0) {
    return <span className="text-muted-foreground/80">Boş sayfa</span>;
  }

  return (
    <div className="min-w-0 flex-1 space-y-2 text-left">
      {blocks.map((b, i) =>
        b.kind === 'heading' ? (
          <p
            key={i}
            className="font-semibold text-foreground leading-snug whitespace-pre-wrap break-words"
          >
            {b.text}
          </p>
        ) : (
          <p
            key={i}
            className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words"
          >
            {b.text}
          </p>
        )
      )}
    </div>
  );
}

export function PreviewStep() {
  const { bookInfo, sections, pages, currentBook } = useBookEditorStore();

  const totalPages = sections.reduce(
    (sum, section) => sum + getWizardSectionPages(section, pages).length,
    0
  );

  const hiddenSectionCount = sections.filter((s) => !s.isVisible).length;
  const emptyPageLabels = sections.flatMap((section) => {
    const sectionPages = getWizardSectionPages(section, pages);
    return sectionPages
      .map((page, index) =>
        pageHasWrittenContent(page.content)
          ? null
          : `${section.title} — Sayfa ${index + 1}`
      )
      .filter((label): label is string => label != null);
  });

  return (
    <div className="space-y-6">
      {emptyPageLabels.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Boş sayfalar</AlertTitle>
          <AlertDescription>
            {emptyPageLabels.join(', ')} — yayınlamadan önce doldurun veya silin.
          </AlertDescription>
        </Alert>
      )}

      {/* Book Info Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Kitap Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookInfo.cover && (
            <div>
              <img
                src={bookInfo.cover}
                alt="Cover"
                className="w-48 h-64 object-cover rounded-lg border"
              />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{bookInfo.title || 'Başlıksız'}</h2>
            {bookInfo.shortDescription && (
              <p className="text-muted-foreground mt-2">{bookInfo.shortDescription}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {bookInfo.isAdult && <Badge variant="destructive">+18</Badge>}
            <Badge variant="outline">
              {currentBook?.isPublished ? 'Yayında' : 'Taslak'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sections Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bölümler ({sections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <p className="text-muted-foreground">Henüz bölüm eklenmedi.</p>
          ) : (
            <div className="space-y-4">
              {hiddenSectionCount > 0 && (
                <Alert className="border-muted-foreground/30 bg-muted/30">
                  <EyeOff className="h-4 w-4" />
                  <AlertTitle>Gizli bölümler</AlertTitle>
                  <AlertDescription>
                    {hiddenSectionCount} bölüm okuyucu listesinde ve yayımda görünmez; yalnızca siz
                    düzenlerken burada listelenir. Aşağıda &quot;Gizli&quot; rozetiyle işaretlidir.
                  </AlertDescription>
                </Alert>
              )}
              {sections.map((section, index) => {
                const sectionPages = getWizardSectionPages(section, pages);
                return (
                  <div
                    key={section.id}
                    className={`p-4 border rounded-lg bg-card ${
                      !section.isVisible ? 'border-dashed border-muted-foreground/40 bg-muted/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                      <h3 className="font-semibold flex items-center gap-2">
                        {index + 1}. {section.title}
                        {!section.isVisible && (
                          <Badge
                            variant="secondary"
                            className="gap-1 font-medium border border-muted-foreground/40"
                          >
                            <EyeOff className="h-3 w-3" />
                            Gizli
                          </Badge>
                        )}
                      </h3>
                      <Badge variant="secondary">
                        {sectionPages.length} sayfa
                      </Badge>
                    </div>
                    {!section.isVisible && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Bu bölüm yayımda okuyucu listesinde görünmez; yalnızca siz düzenlerken
                        görürsünüz.
                      </p>
                    )}
                    {sectionPages.length > 0 && (
                      <div className="mt-3 space-y-4">
                        {sectionPages.slice(0, 3).map((page, pageIndex) => (
                          <div
                            key={page?.id ?? pageIndex}
                            className="text-sm flex gap-2.5 items-start"
                          >
                            <Eye
                              className="h-3.5 w-3.5 shrink-0 mt-1 text-muted-foreground"
                              aria-hidden
                            />
                            <div className="min-w-0 flex-1 space-y-2 border-l border-border/60 pl-3">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Sayfa {pageIndex + 1}
                              </p>
                              <PageContentSnippet html={page?.content ?? ''} />
                            </div>
                          </div>
                        ))}
                        {sectionPages.length > 3 && (
                          <p className="text-sm text-muted-foreground">
                            +{sectionPages.length - 3} sayfa daha
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Özet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Toplam Bölüm</p>
              <p className="text-2xl font-bold">{sections.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Toplam Sayfa</p>
              <p className="text-2xl font-bold">{totalPages}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

