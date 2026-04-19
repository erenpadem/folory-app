'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  stringifyDraftPageContent,
  useBookEditorStore,
} from '../../stores/book-editor.store';
import { getWizardSectionPages } from '../../utils/wizard-section-pages';
import { BookApi } from '@/features/books/infrastructure/api/book.api';
import { unwrapSingleResource } from '@/features/books/infrastructure/api/unwrap-single-resource';
import { BookRepositoryImpl } from '@/features/books/infrastructure/repositories/book.repository.impl';
import { CreateBookUseCase } from '@/features/books/application/use-cases/create-book.use-case';
import { PublishBookUseCase } from '@/features/books/application/use-cases/publish-book.use-case';
import { BookEntity } from '@/features/books';
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
    bookInfo,
    sections,
    pages,
    currentBook,
    draftBookId,
    setCurrentBook,
    setDraftBookId,
  } = useBookEditorStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successKind, setSuccessKind] = useState<'draft' | 'publish' | 'unpublish'>('draft');

  const bookApi = new BookApi();
  const bookRepository = new BookRepositoryImpl(bookApi);
  const createBookUseCase = new CreateBookUseCase(bookRepository);
  const publishBookUseCase = new PublishBookUseCase(bookRepository);

  const isPublished = Boolean(currentBook?.isPublished);

  const handleUnpublish = async () => {
    setIsUnpublishing(true);
    setError(null);

    try {
      const bookId = currentBook?.id ?? draftBookId;
      if (!bookId || !currentBook) {
        setError('Kitap bulunamadı.');
        return;
      }

      await saveSectionsAndPages(bookId);
      await bookApi.updateBook(bookId, { is_draft: true });
      const prev = useBookEditorStore.getState().currentBook ?? currentBook;
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
      let bookId = currentBook?.id ?? draftBookId ?? undefined;

      // Create book if it doesn't exist
      if (!bookId) {
        const newBook = await createBookUseCase.execute({
          title: bookInfo.title,
          short_description: bookInfo.shortDescription || undefined,
          category_id: bookInfo.categoryId || undefined,
          is_adult: bookInfo.isAdult,
          is_draft: true,
        });
        bookId = newBook.id;
        setCurrentBook(newBook);
        setDraftBookId(newBook.id);
      }

      // Save sections and pages
      if (bookId) {
        await saveSectionsAndPages(bookId);
      }

      setSuccessKind('draft');
      setSuccess(true);
      void queryClient.invalidateQueries({ queryKey: ['user-books'] });
      setTimeout(() => {
        router.push('/dashboard/books');
      }, 2000);
    } catch (err: any) {
      setError(err?.message || String(err) || 'Bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const saveSectionsAndPages = async (bookId: number) => {
    const savedSectionsMap = new Map<number, number>(); // tempId -> realId
    
    // Client uses negative IDs for unsynced entities; server IDs are positive.
    // Save sections
    for (const section of sections) {
      if (section.id < 0) {
        const raw = await bookApi.createSection(bookId, {
          title: section.title,
          order: section.order,
          is_visible: section.isVisible,
        });
        const created = unwrapSingleResource(raw.data ?? raw);
        savedSectionsMap.set(section.id, created.id as number);
      } else {
        await bookApi.updateSection(bookId, section.id, {
          title: section.title,
          order: section.order,
          is_visible: section.isVisible,
        });
        savedSectionsMap.set(section.id, section.id);
      }
    }

    // Save pages
    for (const section of sections) {
      const realSectionId = savedSectionsMap.get(section.id) ?? section.id;
      const sectionPages = getWizardSectionPages(section, pages);

      // DB unique (section_id, order): enforce 0..n-1 so duplicate client orders cannot collide
      const sortedPages = [...sectionPages].sort((a, b) => {
        const oa = a.order ?? 0;
        const ob = b.order ?? 0;
        if (oa !== ob) return oa - ob;
        return a.id - b.id;
      });

      for (let i = 0; i < sortedPages.length; i++) {
        const page = sortedPages[i];
        if (page.id < 0) {
          await bookApi.createPage(realSectionId, {
            content: stringifyDraftPageContent(page.content),
            order: i,
          });
        } else {
          await bookApi.updatePage(realSectionId, page.id, {
            content: stringifyDraftPageContent(page.content),
            order: page.order ?? i,
          });
        }
      }

      // Sunucuda kalan ama istemcide silinmiş sayfaları kaldır (taslak/yayın kaydı)
      if (realSectionId > 0) {
        const keepIds = new Set(
          sortedPages
            .map((p) => p.id)
            .filter((id): id is number => typeof id === 'number' && id > 0)
        );
        const listRes = await bookApi.getPages(realSectionId);
        const rows = listRes.data ?? [];
        for (const row of rows) {
          const pid =
            typeof row === 'object' && row != null && 'id' in row
              ? Number((row as { id: number }).id)
              : NaN;
          if (Number.isFinite(pid) && pid > 0 && !keepIds.has(pid)) {
            await bookApi.deletePage(realSectionId, pid);
          }
        }
      }
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);

    try {
      let bookId = currentBook?.id ?? draftBookId ?? undefined;

      // Create book if it doesn't exist
      if (!bookId) {
        const newBook = await createBookUseCase.execute({
          title: bookInfo.title,
          short_description: bookInfo.shortDescription || undefined,
          category_id: bookInfo.categoryId || undefined,
          is_adult: bookInfo.isAdult,
          is_draft: false,
        });
        bookId = newBook.id;
        setCurrentBook(newBook);
        setDraftBookId(newBook.id);
      }

      // Save sections and pages first
      if (bookId) {
        await saveSectionsAndPages(bookId);
        await publishBookUseCase.execute(bookId);
        const prev = useBookEditorStore.getState().currentBook;
        if (prev) {
          setCurrentBook(withPublishFlags(prev, true, false));
        }
        setDraftBookId(bookId);
      }

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
          disabled={isSaving || isPublishing || isUnpublishing}
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

