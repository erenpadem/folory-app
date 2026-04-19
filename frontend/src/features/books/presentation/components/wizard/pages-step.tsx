'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useBookEditorStore } from '../../stores/book-editor.store';
import { getWizardSectionPages } from '../../utils/wizard-section-pages';
import {
  getWizardPageOneBased,
  getWizardSectionSlug,
  WIZARD_URL_PAGE,
  WIZARD_URL_SECTION,
} from '../../utils/wizard-write-url';
import { PageEntity } from '@/features/books';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

/** TipTap HTML → plain text for list previews (no raw tags); satır sonları korunur. */
function htmlToPreviewText(html: string, maxLen = 220): string {
  if (!html || !html.trim()) return '';
  const normalize = (t: string) =>
    t
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => line.replace(/[ \t\f\v]+/g, ' ').trimEnd())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  if (typeof window !== 'undefined' && 'DOMParser' in window) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = doc.body.textContent || '';
    const trimmed = normalize(text);
    return trimmed.length > maxLen ? trimmed.slice(0, maxLen) + '…' : trimmed;
  }
  const text = normalize(html.replace(/<[^>]+>/g, '\n').replace(/[ \t]+/g, ' '));
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

/**
 * Sihirbaz adım 3: yalnızca sayfa oluşturma / seçme / silme.
 * İçerik yazımı adım 4 (PagesWriteStep).
 */
export function PagesStep() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    sections,
    pages,
    activeSectionId,
    activePageId,
    setActiveSection,
    setActivePage,
    setCurrentStep,
    addPage,
    deletePage,
  } = useBookEditorStore();
  const canProceed = useBookEditorStore((s) => s.canProceedToNextStep());

  const activeSection = sections.find((s) => s.id === activeSectionId);
  const activeSectionPages = activeSection
    ? getWizardSectionPages(activeSection, pages)
    : [];

  useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      setActiveSection(sections[0].id);
    }
  }, [sections, activeSectionId, setActiveSection]);

  const handlePageSelect = (pageId: number) => {
    setActivePage(pageId);
    setCurrentStep(4);
    if (
      typeof window !== 'undefined' &&
      (pathname?.startsWith('/dashboard/books/update/') || pathname === '/dashboard/books/new')
    ) {
      const sec = sections.find((s) => s.id === activeSectionId);
      if (!sec) return;
      const slug = getWizardSectionSlug(sec, sections);
      const oneBased = getWizardPageOneBased(pageId, sec, pages);
      const url = new URL(window.location.href);
      url.searchParams.set('step', '4');
      url.searchParams.set(WIZARD_URL_SECTION, slug);
      url.searchParams.set(WIZARD_URL_PAGE, String(oneBased));
      router.replace(url.pathname + url.search, { scroll: false });
    }
  };

  const handleCreateNewPage = () => {
    if (!activeSectionId || !activeSection) return;
    const nextOneBased = activeSectionPages.length + 1;
    const tempId = -(Date.now() + Math.floor(Math.random() * 1000));
    const now = new Date();
    const newPage = new PageEntity(
      tempId,
      activeSectionId,
      '',
      activeSectionPages.length,
      now,
      now
    );
    addPage(activeSectionId, newPage);
    setActivePage(newPage.id);
    setCurrentStep(4);
    if (
      typeof window !== 'undefined' &&
      (pathname?.startsWith('/dashboard/books/update/') || pathname === '/dashboard/books/new')
    ) {
      const slug = getWizardSectionSlug(activeSection, sections);
      const url = new URL(window.location.href);
      url.searchParams.set('step', '4');
      url.searchParams.set(WIZARD_URL_SECTION, slug);
      url.searchParams.set(WIZARD_URL_PAGE, String(nextOneBased));
      router.replace(url.pathname + url.search, { scroll: false });
    }
  };

  if (sections.length === 0) {
    return (
      <div className="text-center py-12">
        <Card className="p-12">
          <p className="text-muted-foreground text-lg">
            Önce bölüm eklemeniz gerekiyor. Lütfen önceki adıma dönün.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto">
        Sayfaları burada ekleyip silebilirsiniz. Bir sayfaya tıklayınca doğrudan yazım ekranında
        açılır; veya <strong>İleri</strong> ile yazım adımına geçebilirsiniz.
      </p>
      {!canProceed && sections.length > 0 && (
        <p className="text-sm text-amber-700 dark:text-amber-400 text-center max-w-xl mx-auto">
          İleri ile Yazım adımına geçmek için <strong>her bölümde</strong> en az bir sayfa olmalıdır.
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Label className="text-lg font-semibold mb-4 block">Bölüm Seç</Label>
        <Select
          value={activeSectionId?.toString() || ''}
          onValueChange={(value) => setActiveSection(value ? Number(value) : null)}
        >
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Bölüm seçin" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem key={section.id} value={section.id.toString()}>
                {section.title} ({getWizardSectionPages(section, pages).length} sayfa)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {activeSection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">
              {activeSection.title} - Sayfalar ({activeSectionPages.length})
            </Label>
            <Button onClick={handleCreateNewPage} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Yeni Sayfa
            </Button>
          </div>

          {activeSectionPages.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                Bu bölümde henüz sayfa yok.
              </p>
              <Button onClick={handleCreateNewPage}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Sayfayı Oluştur
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {activeSectionPages.filter((p) => p != null).map((page, index) => (
                  <motion.div
                    key={page.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card
                      className={`p-4 hover:shadow-lg transition-all cursor-pointer group border-2 ${
                        activePageId === page.id ? 'border-primary/60 bg-primary/5' : 'border-transparent'
                      }`}
                      onClick={() => handlePageSelect(page.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          Sayfa {index + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePage(activeSectionId!, page.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line break-words">
                        {htmlToPreviewText(page?.content ?? '') || 'Boş sayfa'}
                      </p>
                      <div className="mt-3 flex items-center text-xs text-muted-foreground">
                        <ChevronRight className="h-3 w-3 mr-1" />
                        Tıklayınca yazım ekranında açılır
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      {!activeSectionId && sections.length > 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            Lütfen yukarıdan bir bölüm seçin.
          </p>
        </Card>
      )}
    </div>
  );
}
