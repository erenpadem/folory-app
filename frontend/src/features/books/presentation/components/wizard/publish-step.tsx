'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useBookEditorStore } from '../../stores/book-editor.store';
import { BookApi } from '@/features/books/infrastructure/api/book.api';
import { BookRepositoryImpl } from '@/features/books/infrastructure/repositories/book.repository.impl';
import { PublishBookUseCase } from '@/features/books/application/use-cases/publish-book.use-case';
import { BookEntity } from '@/features/books';
import { pageHasWrittenContent } from '@/lib/page-content';
import { getWizardSectionPages } from '../../utils/wizard-section-pages';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

/** PUT/Publish yanıtları genelde bölüm içermez; bayrakları güncellerken editör state'ini silmemek için. */
function withPublishFlags(book: BookEntity, isPublished: boolean, isDraft: boolean): BookEntity {
  return BookEntity.fromPrimitives({
    ...book.toPrimitives(),
    is_published: isPublished,
    is_draft: isDraft,
  });
}

export function PublishStep() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    currentBook,
    setCurrentBook,
    setDraftBookId,
    saveDraft,
    sections,
    pages,
    validateStep,
  } = useBookEditorStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successKind, setSuccessKind] = useState<'draft' | 'publish' | 'unpublish'>('draft');

  const bookApi = new BookApi();
  const bookRepository = new BookRepositoryImpl(bookApi);
  const publishBookUseCase = new PublishBookUseCase(bookRepository);

  const isPublished = Boolean(currentBook?.isPublished);
  const canPublish = validateStep(5);

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

  const handleUnpublish = async () => {
    setIsUnpublishing(true);
    setError(null);

    try {
      const bookId = await ensureDraftSynced();
      await bookApi.updateBook(bookId, { is_draft: true });
      const prev = useBookEditorStore.getState().currentBook ?? currentBook;
      if (!prev) {
        setError('Kitap bulunamadı.');
        return;
      }
      setCurrentBook(withPublishFlags(prev, false, true));
      setDraftBookId(bookId);

      setSuccessKind('unpublish');
      setSuccess(true);
      void queryClient.invalidateQueries({ queryKey: ['user-books'] });
      void queryClient.invalidateQueries({ queryKey: ['book'] });
      setTimeout(() => {
        router.push('/dashboard/books');
      }, 2000);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        ax?.response?.data?.message ||
          ax?.message ||
          'Yayından kaldırma sırasında bir hata oluştu'
      );
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await ensureDraftSynced();

      setSuccessKind('draft');
      setSuccess(true);
      void queryClient.invalidateQueries({ queryKey: ['user-books'] });
      setTimeout(() => {
        router.push('/dashboard/books');
      }, 2000);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        ax?.response?.data?.message ||
          ax?.message ||
          'Bir hata oluştu'
      );
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Wizard autosave ile aynı yol: POST /books/draft (bölüm/sayfa prune dahil).
   */
  const ensureDraftSynced = async (): Promise<number> => {
    await saveDraft({ force: true });

    const syncedId =
      useBookEditorStore.getState().draftBookId
      ?? useBookEditorStore.getState().currentBook?.id;

    if (!syncedId) {
      throw new Error('Kitap bulunamadı.');
    }

    return syncedId;
  };

  const handlePublish = async () => {
    if (!canPublish) {
      setError('Boş sayfa içeren kitaplar yayınlanamaz. Lütfen tüm sayfaları doldurun.');
      return;
    }
    setIsPublishing(true);
    setError(null);

    try {
      const bookId = await ensureDraftSynced();
      await publishBookUseCase.execute(bookId);
      const prev = useBookEditorStore.getState().currentBook;
      if (prev) {
        setCurrentBook(withPublishFlags(prev, true, false));
      }
      setDraftBookId(bookId);

      setSuccessKind('publish');
      setSuccess(true);
      void queryClient.invalidateQueries({ queryKey: ['user-books'] });
      void queryClient.invalidateQueries({ queryKey: ['book'] });
      setTimeout(() => {
        router.push('/dashboard/books');
      }, 2000);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        ax?.response?.data?.message ||
          ax?.message ||
          'Yayınlama sırasında bir hata oluştu'
      );
    } finally {
      setIsPublishing(false);
    }
  };

  if (success) {
    const successLine =
      successKind === 'publish'
        ? 'yayınlandı'
        : successKind === 'unpublish'
          ? 'yayından kaldırıldı'
          : 'taslak olarak kaydedildi';
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Başarılı!</h3>
        <p className="text-muted-foreground">Kitabınız {successLine}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Kitabınızı Yayınlayın</h3>
        <p className="text-muted-foreground mb-6">
          {isPublished
            ? 'Kitap şu anda yayında. Yayından kaldırmak için sağdaki düğmeyi kullanın; yalnızca içeriği kaydetmek için soldaki taslak kaydı kullanın.'
            : 'Kitabınızı taslak olarak kaydedebilir veya doğrudan yayınlayabilirsiniz.'}
        </p>
      </div>

      {emptyPageLabels.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Boş sayfalar: {emptyPageLabels.join(', ')}. Yayınlamadan önce bu sayfaları doldurun
            veya silin.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isSaving || isPublishing || isUnpublishing}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            'Taslak Olarak Kaydet'
          )}
        </Button>
        <Button
          variant={isPublished ? 'destructive' : 'default'}
          onClick={isPublished ? handleUnpublish : handlePublish}
          disabled={isSaving || isPublishing || isUnpublishing || (!isPublished && !canPublish)}
          className="flex-1"
        >
          {isPublished ? (
            isUnpublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaldırılıyor...
              </>
            ) : (
              'Yayından kaldır'
            )
          ) : isPublishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Yayınlanıyor...
            </>
          ) : (
            'Yayınla'
          )}
        </Button>
      </div>
    </div>
  );
}

