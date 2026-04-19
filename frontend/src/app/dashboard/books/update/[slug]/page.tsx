'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useBookEditorStore } from '@/features/books/presentation/stores/book-editor.store';
import { BookInfoStep } from '@/features/books/presentation/components/wizard/book-info-step';
import { SectionsStep } from '@/features/books/presentation/components/wizard/sections-step';
import { PagesStep } from '@/features/books/presentation/components/wizard/pages-step';
import { PagesWriteStep } from '@/features/books/presentation/components/wizard/pages-write-step';
import { PreviewStep } from '@/features/books/presentation/components/wizard/preview-step';
import { PublishStep } from '@/features/books/presentation/components/wizard/publish-step';
import { BOOK_WIZARD_STEPS } from '@/features/books/presentation/components/wizard/book-wizard-stepper';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDominantColors } from '@/lib/image-colors';
import { useAutoSave } from '@/hooks/use-autosave';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/lib/api-client';
import { BookEntity } from '@/features/books';
import { clearWizardWriteContextParams } from '@/features/books/presentation/utils/wizard-write-url';
import { cn } from '@/lib/utils';

export default function UpdateBookPage() {
  const router = useRouter();
  const params = useParams();
  // Slug can be either ID or slug - try to parse as number first
  const slugOrId = params.slug as string;
  const bookId = isNaN(Number(slugOrId)) ? null : Number(slugOrId);
  const { 
    currentStep, 
    nextStep, 
    previousStep, 
    canProceedToNextStep, 
    bookInfo, 
    lastSavedAt,
    loadBook,
    setCurrentStep,
    setDraftBookId,
  } = useBookEditorStore();
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  /** Aynı kitap için adımı URL / içerikten yalnızca ilk yüklemede ayarla (refetch’te sıçrama olmasın). */
  const stepInitForSlugRef = useRef<string | null>(null);

  // Enable autosave
  useAutoSave();

  // Load book data
  const { data: bookData, isLoading } = useQuery({
    queryKey: ['book', slugOrId],
    queryFn: async () => {
      // Use ID if it's a number, otherwise use as slug (if backend supports it)
      const endpoint = bookId ? `/books/${bookId}` : `/books/${slugOrId}`;
      const response = await api.get(endpoint);
      return response.data;
    },
    enabled: !!slugOrId,
  });

  useEffect(() => {
    stepInitForSlugRef.current = null;
  }, [slugOrId]);

  // Load book; adım: ?step= yoksa sunucudaki içeriğe göre ilk eksik sihirbaz adımı
  useEffect(() => {
    if (!bookData?.data) return;
    const book = bookData.data;
    const bookEntity = BookEntity.fromPrimitives(book);
    loadBook(bookEntity);
    setDraftBookId(book.id);

    if (typeof window === 'undefined') return;

    const firstStepInit = stepInitForSlugRef.current !== slugOrId;
    if (!firstStepInit) return;

    stepInitForSlugRef.current = slugOrId;

    const stepParam = new URLSearchParams(window.location.search).get('step');
    if (stepParam) {
      const step = parseInt(stepParam, 10);
      if (step >= 1 && step <= 5) {
        setCurrentStep(step);
      }
      return;
    }

    const resume = bookEntity.getResumeWizardStep();
    setCurrentStep(resume);
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(resume));
    router.replace(url.pathname + url.search, { scroll: false });
  }, [bookData, loadBook, setDraftBookId, setCurrentStep, router, slugOrId]);

  useEffect(() => {
    if (bookInfo.cover) {
      getDominantColors(bookInfo.cover).then((colors) => {
        if (colors && colors.length > 0) {
          setDominantColor(colors[0]);
        }
      });
    } else {
      setDominantColor(null);
    }
  }, [bookInfo.cover]);

  const isWriteStep = currentStep === 4;

  const backgroundStyle = useMemo(() => {
    if (dominantColor && bookInfo.cover) {
      return {
        background: `linear-gradient(135deg, ${dominantColor}15 0%, ${dominantColor}05 50%, transparent 100%)`,
      };
    }
    return {};
  }, [dominantColor, bookInfo.cover]);

  const handleNext = () => {
    if (canProceedToNextStep()) {
      if (currentStep < 5) {
        nextStep();
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          const stepAfter = useBookEditorStore.getState().currentStep;
          url.searchParams.set('step', String(stepAfter));
          if (stepAfter !== 4) {
            clearWizardWriteContextParams(url);
          }
          router.replace(url.pathname + url.search, { scroll: false });
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      previousStep();
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const stepAfter = useBookEditorStore.getState().currentStep;
        url.searchParams.set('step', String(stepAfter));
        if (stepAfter !== 4) {
          clearWizardWriteContextParams(url);
        }
        router.replace(url.pathname + url.search, { scroll: false });
      }
    } else {
      router.push('/dashboard/books');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BookInfoStep />;
      case 2:
        return <SectionsStep />;
      case 3:
        return <PagesStep />;
      case 4:
        return (
          <Suspense
            fallback={
              <div className="py-12 text-center text-muted-foreground text-sm">
                Yazım ekranı yükleniyor…
              </div>
            }
          >
            <PagesWriteStep />
          </Suspense>
        );
      case 5:
        return (
          <div className="space-y-6">
            <PreviewStep />
            <PublishStep />
          </div>
        );
      default:
        return <BookInfoStep />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-5xl px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <AnimatePresence>
        {!isWriteStep && bookInfo.cover && dominantColor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={backgroundStyle}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={cn(
          'container mx-auto',
          isWriteStep ? 'max-w-none px-0 py-0' : 'py-8 max-w-5xl px-4'
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={isWriteStep ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={isWriteStep ? undefined : { opacity: 0, y: -20 }}
            transition={{ duration: isWriteStep ? 0 : 0.3 }}
          >
            {!isWriteStep && (
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {BOOK_WIZARD_STEPS[currentStep - 1].icon}{' '}
                    {BOOK_WIZARD_STEPS[currentStep - 1].title}
                  </h1>
                  <p className="text-muted-foreground">
                    {currentStep === 1 && 'Kitabınızın temel bilgilerini güncelleyin'}
                    {currentStep === 2 && 'Bölümlerinizi oluşturun ve düzenleyin'}
                    {currentStep === 3 && 'Her bölüm için sayfaları oluşturun veya düzenleyin'}
                    {currentStep === 5 && 'Kitabınızın önizlemesini görün ve yayınlayın'}
                  </p>
                  {lastSavedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Son kayıt: {lastSavedAt.toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </motion.div>
              </div>
            )}

            {/* Step Content */}
            <motion.div
              initial={isWriteStep ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: isWriteStep ? 0 : 0.2 }}
              className={cn(!isWriteStep && 'mb-8')}
            >
              {renderStep()}
            </motion.div>

            {!isWriteStep && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-between items-center"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={handlePrevious}
                  className="group"
                >
                  <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  {currentStep === 1 ? 'İptal' : 'Geri'}
                </Button>
                {currentStep < 5 && (
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleNext}
                    disabled={!canProceedToNextStep()}
                    className="group"
                  >
                    İleri
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

