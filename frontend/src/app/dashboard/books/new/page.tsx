'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useBookEditorStore } from '@/features/books/presentation/stores/book-editor.store';
import { BookInfoStep } from '@/features/books/presentation/components/wizard/book-info-step';
import { SectionsStep } from '@/features/books/presentation/components/wizard/sections-step';
import { PagesStep } from '@/features/books/presentation/components/wizard/pages-step';
import { PagesWriteStep } from '@/features/books/presentation/components/wizard/pages-write-step';
import { PreviewStep } from '@/features/books/presentation/components/wizard/preview-step';
import { PublishStep } from '@/features/books/presentation/components/wizard/publish-step';
import { BOOK_WIZARD_STEPS } from '@/features/books/presentation/components/wizard/book-wizard-stepper';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDominantColors } from '@/lib/image-colors';
import { useAutoSave } from '@/hooks/use-autosave';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { removeLegacyBookPageLocalStorageKeys } from '@/lib/book-page-local-storage';
import { clearWizardWriteContextParams } from '@/features/books/presentation/utils/wizard-write-url';
import { cn } from '@/lib/utils';

export default function NewBookPage() {
  const router = useRouter();
  const {
    currentStep,
    nextStep,
    previousStep,
    canProceedToNextStep,
    reset,
    bookInfo,
    lastSavedAt,
    lastLocalSavedAt,
    pendingServerSync,
    isSaving,
  } = useBookEditorStore();
  const saveDraft = useBookEditorStore((s) => s.saveDraft);
  const isOnline = useOnlineStatus();
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  /** Avoid SSR/client mismatch: persisted store differs from server snapshot (see zustand persist). */
  const [hasMounted, setHasMounted] = useState(false);
  /** Yeni kitap: persist'ten gelen önceki taslakları sıfırlayana kadar otomatik kayıt kapalı. */
  const [editorReady, setEditorReady] = useState(false);

  // Enable autosave only after persisted state is cleared for a fresh "new book" session
  useAutoSave({ enabled: editorReady });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const startFresh = () => {
      useBookEditorStore.persist.clearStorage();
      removeLegacyBookPageLocalStorageKeys();
      reset();
      setEditorReady(true);
    };

    if (useBookEditorStore.persist.hasHydrated()) {
      startFresh();
      return;
    }

    const unsub = useBookEditorStore.persist.onFinishHydration(startFresh);
    return unsub;
  }, [reset]);

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

  const backgroundStyle = useMemo(() => {
    if (dominantColor && bookInfo.cover) {
      return {
        background: `linear-gradient(135deg, ${dominantColor}15 0%, ${dominantColor}05 50%, transparent 100%)`,
      };
    }
    return {};
  }, [dominantColor, bookInfo.cover]);

  if (!editorReady) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        <p className="text-sm">Yeni kitap formu hazırlanıyor…</p>
      </div>
    );
  }

  const syncNewWizardUrl = (step: number) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(step));
    if (step !== 4) {
      clearWizardWriteContextParams(url);
    }
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const handleNext = () => {
    if (canProceedToNextStep()) {
      if (currentStep < 5) {
        nextStep();
        syncNewWizardUrl(useBookEditorStore.getState().currentStep);
        if (bookInfo.title.trim()) {
          void saveDraft();
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      previousStep();
      syncNewWizardUrl(useBookEditorStore.getState().currentStep);
    } else {
      router.push('/dashboard/books');
    }
  };

  const isWriteStep = currentStep === 4;

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
            {/* Header — yazım adımında tam ekran editör; başlık yok */}
            {!isWriteStep && (
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h1 className="text-4xl font-bold mb-2 text-foreground">
                    {BOOK_WIZARD_STEPS[currentStep - 1].title}
                  </h1>
                  <p className="text-muted-foreground text-base">
                    {currentStep === 1 && 'Kitabınızın temel bilgilerini girin'}
                    {currentStep === 2 && 'Bölümlerinizi oluşturun ve düzenleyin'}
                    {currentStep === 3 && 'Her bölüm için sayfaları oluşturun veya düzenleyin'}
                    {currentStep === 5 && 'Kitabınızın önizlemesini görün ve yayınlayın'}
                  </p>
                  {hasMounted && !isOnline && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 max-w-lg mx-auto">
                      Çevrimdışı: düzenlemeler bu cihazda saklanıyor; bağlantı gelince sunucuya
                      yüklenecek.
                    </p>
                  )}
                  {hasMounted && isOnline && pendingServerSync && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 max-w-lg mx-auto">
                      Sunucu senkronu bekleniyor veya son kayıt tamamlanamadı; bağlantıyı kontrol
                      edin.
                    </p>
                  )}
                  {hasMounted && isOnline && isSaving && (
                    <p className="text-xs text-muted-foreground mt-2">Taslak sunucuya kaydediliyor…</p>
                  )}
                  {hasMounted && (lastSavedAt || lastLocalSavedAt) && (
                    <p className="text-xs text-muted-foreground mt-3">
                      {[
                        lastSavedAt &&
                          `Sunucu: ${lastSavedAt.toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`,
                        lastLocalSavedAt &&
                          `Yerel: ${lastLocalSavedAt.toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
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

            {/* Yazım adımında: Geri/İleri yok; geçiş editör üst çubuğundan (Sayfalar / İlerle) */}
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
                    disabled={!hasMounted || !canProceedToNextStep()}
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
