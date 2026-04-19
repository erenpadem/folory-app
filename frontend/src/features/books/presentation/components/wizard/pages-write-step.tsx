'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useBookEditorStore } from '../../stores/book-editor.store';
import {
  findWizardSectionBySlug,
  getWizardPageOneBased,
  getWizardSectionSlug,
  sortWizardSectionPages,
  WIZARD_URL_PAGE,
  WIZARD_URL_SECTION,
  clearWizardWriteContextParams,
} from '../../utils/wizard-write-url';
import { PageEntity } from '@/features/books';
import { FullScreenPageEditor } from './fullscreen-page-editor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Sihirbaz adım 4: sayfa içeriği yazımı (liste adım 3’te).
 * Tam ekran sekmesi yok; taslak autosave üst düzey store + useAutoSave ile devam eder.
 */
export function PagesWriteStep() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const saveDraft = useBookEditorStore((s) => s.saveDraft);
  const currentStep = useBookEditorStore((s) => s.currentStep);
  const {
    sections,
    pages,
    activeSectionId,
    activePageId,
    setActivePage,
    setActiveSection,
    addPage,
    updatePage,
    setCurrentStep,
    nextStep,
  } = useBookEditorStore();
  const canAdvanceWizard = useBookEditorStore((s) => s.validateStep(s.currentStep));

  const isWizardPath =
    pathname?.startsWith('/dashboard/books/update/') || pathname === '/dashboard/books/new';

  const replaceWizardStepInUrl = (step: number) => {
    if (typeof window === 'undefined' || !isWizardPath) return;
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(step));
    if (step !== 4) {
      clearWizardWriteContextParams(url);
    }
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const advanceWizard = async () => {
    if (!useBookEditorStore.getState().canProceedToNextStep()) return;
    await saveDraft({ force: true });
    nextStep();
    replaceWizardStepInUrl(useBookEditorStore.getState().currentStep);
  };

  const activeSection = sections.find((s) => s.id === activeSectionId);
  const activeSectionPages = activeSection
    ? sortWizardSectionPages(activeSection, pages)
    : [];
  const activePage = activePageId
    ? activeSectionPages.find((p) => p.id === activePageId)
    : null;

  /** Adres çubuğu / geri ile gelen ?section=&page= → store (URL ile store çelişirse URL baskın). */
  useEffect(() => {
    if (currentStep !== 4 || sections.length === 0) return;
    const sectionQ = searchParams.get(WIZARD_URL_SECTION);
    const pageQ = searchParams.get(WIZARD_URL_PAGE);
    if (!sectionQ || !pageQ) return;

    const secFromUrl = findWizardSectionBySlug(sectionQ, sections);
    if (!secFromUrl) return;

    const list = sortWizardSectionPages(secFromUrl, pages);
    if (list.length === 0) return;

    const n = parseInt(pageQ, 10);
    const idx =
      Number.isFinite(n) && n >= 1 ? Math.min(n - 1, list.length - 1) : 0;
    const page = list[idx];
    if (!page) return;

    const slugStore =
      activeSectionId != null
        ? sections.find((s) => s.id === activeSectionId)
        : undefined;
    const slugCur =
      slugStore != null ? getWizardSectionSlug(slugStore, sections) : null;
    const oneCur =
      slugStore != null && activePageId != null
        ? getWizardPageOneBased(activePageId, slugStore, pages)
        : null;

    if (
      slugCur === getWizardSectionSlug(secFromUrl, sections) &&
      oneCur === idx + 1
    ) {
      return;
    }

    setActiveSection(secFromUrl.id);
    setActivePage(page.id);
  }, [
    currentStep,
    sections,
    pages,
    searchParams,
    activeSectionId,
    activePageId,
    setActiveSection,
    setActivePage,
  ]);

  /** Store → URL (yazım adımında konum paylaşılabilir / yenilenebilir). */
  useEffect(() => {
    if (!isWizardPath || currentStep !== 4) return;
    if (activeSectionId == null || activePageId == null) return;
    const sec = sections.find((s) => s.id === activeSectionId);
    if (!sec) return;

    const slug = getWizardSectionSlug(sec, sections);
    const oneBased = getWizardPageOneBased(activePageId, sec, pages);
    const url = new URL(
      typeof window !== 'undefined' ? window.location.href : 'http://local/'
    );
    if (
      url.searchParams.get('step') === '4' &&
      url.searchParams.get(WIZARD_URL_SECTION) === slug &&
      url.searchParams.get(WIZARD_URL_PAGE) === String(oneBased)
    ) {
      return;
    }
    url.searchParams.set('step', '4');
    url.searchParams.set(WIZARD_URL_SECTION, slug);
    url.searchParams.set(WIZARD_URL_PAGE, String(oneBased));
    router.replace(url.pathname + url.search, { scroll: false });
  }, [
    isWizardPath,
    currentStep,
    activeSectionId,
    activePageId,
    sections,
    pages,
    router,
  ]);

  const goToPageList = async () => {
    await saveDraft({ force: true });
    setCurrentStep(3);
    replaceWizardStepInUrl(3);
  };

  if (sections.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-muted-foreground mb-4">Önce bölüm eklemeniz gerekiyor.</p>
        <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
          Bölümlere dön
        </Button>
      </Card>
    );
  }

  if (!activePage || !activeSection) {
    return (
      <Card className="p-10 text-center max-w-lg mx-auto space-y-4">
        <p className="text-muted-foreground">
          Yazılacak sayfa bulunamadı. Önce <strong>Sayfalar</strong> adımında her bölüme en az bir sayfa ekleyin.
        </p>
        <Button type="button" onClick={goToPageList}>
          Sayfalar adımına git
        </Button>
      </Card>
    );
  }

  const pageIndex = activeSectionPages.findIndex((p) => p.id === activePage.id);

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);
  const sectionFirstPages = sortedSections
    .map((sec) => {
      const list = sortWizardSectionPages(sec, pages);
      const first = list[0];
      return first ? { sectionId: sec.id, pageId: first.id } : null;
    })
    .filter((x): x is { sectionId: number; pageId: number } => x != null);

  const currentSectionPagePickerOptions = activeSectionPages.map((p, idx) => ({
    pageId: p.id,
    sectionId: activeSection!.id,
    label: `Sayfa ${idx + 1}`,
  }));

  return (
    <FullScreenPageEditor
      layout="fullscreen"
      reserveWizardFooter={false}
      page={activePage}
      pageIndex={pageIndex}
      allPages={activeSectionPages}
      sortedSections={sortedSections}
      activeSectionId={activeSectionId!}
      sectionFirstPages={sectionFirstPages}
      currentSectionPagePickerOptions={currentSectionPagePickerOptions}
      onClose={goToPageList}
      onSave={(content) => {
        const updatedPage = new PageEntity(
          activePage.id,
          activePage.sectionId,
          content,
          activePage.order,
          activePage.createdAt,
          new Date()
        );
        updatePage(activeSectionId!, activePage.id, updatedPage);
      }}
      onActivateWritePage={(sectionId, pageId) => {
        setActiveSection(sectionId);
        setActivePage(pageId);
      }}
      onCreateNewPage={() => {
        if (!activeSectionId || !activeSection) return;
        const tempId = -(Date.now() + Math.floor(Math.random() * 1000));
        const now = new Date();
        const list = sortWizardSectionPages(activeSection, pages);
        const newPage = new PageEntity(
          tempId,
          activeSectionId,
          '',
          list.length,
          now,
          now
        );
        addPage(activeSectionId, newPage);
        setActivePage(newPage.id);
      }}
      onAdvanceWizard={advanceWizard}
      canAdvanceWizard={canAdvanceWizard}
    />
  );
}
