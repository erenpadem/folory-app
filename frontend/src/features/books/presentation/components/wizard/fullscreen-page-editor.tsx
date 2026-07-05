'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import { PageEntity, SectionEntity } from '@/features/books';
import { FloatingToolbar } from './floating-toolbar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, ChevronLeft, LayoutList, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBookEditorStore } from '../../stores/book-editor.store';
import { useAuthStore } from '@/stores/auth.store';
import {
  getBookPageLocalStorageKey,
  readBookPageLocalStorageBackup,
} from '@/lib/book-page-local-storage';
import { isContentOverLimit } from '@/lib/page-content-calculator';
import { cn } from '@/lib/utils';

export interface WritePagePickerOption {
  pageId: number;
  sectionId: number;
  label: string;
}

interface FullScreenPageEditorProps {
  page: PageEntity;
  pageIndex: number;
  allPages: PageEntity[];
  /** Bölüm sırası (order); yazım üstünde geçiş için */
  sortedSections: SectionEntity[];
  activeSectionId: number;
  /** Aktif bölümdeki sayfalar (liste: yalnızca "Sayfa N") */
  currentSectionPagePickerOptions: WritePagePickerOption[];
  onClose: () => void | Promise<void>;
  onSave: (content: string) => void;
  /** Bölüm + sayfa birlikte (URL / store tutarlılığı) */
  onActivateWritePage: (sectionId: number, pageId: number) => void;
  /** Bölüm seçici: hedef bölümde sayfa yoksa oluşturulur */
  onActivateSection: (sectionId: number) => void;
  onCreateNewPage: () => void;
  /** Adım 5’e geç (Kaydet sonrası içerik flush edilir) */
  onAdvanceWizard: () => void | Promise<void>;
  canAdvanceWizard: boolean;
  /** Sihirbaz adım 4: tam ekran yerine akış içinde gömülü (geri atma / z-index sorunları azalır) */
  layout?: 'fullscreen' | 'embedded';
  /** Sihirbaz alt Geri/İleri çubuğu varsa editörün altında boşluk bırak */
  reserveWizardFooter?: boolean;
}

export function FullScreenPageEditor({
  page,
  pageIndex,
  allPages,
  sortedSections,
  activeSectionId,
  currentSectionPagePickerOptions,
  onClose,
  onSave,
  onActivateWritePage,
  onActivateSection,
  onCreateNewPage,
  onAdvanceWizard,
  canAdvanceWizard,
  layout = 'fullscreen',
  reserveWizardFooter = false,
}: FullScreenPageEditorProps) {
  const embedded = layout === 'embedded';
  const { draftBookId } = useBookEditorStore();
  const saveDraft = useBookEditorStore((s) => s.saveDraft);
  const draftSaving = useBookEditorStore((s) => s.isSaving);
  const userId = useAuthStore((s) => s.user?.id);
  const pageStorageKey = getBookPageLocalStorageKey(userId, draftBookId, page.id);
  const [isToolbarHovered, setIsToolbarHovered] = useState(false);
  const [toolbarMounted, setToolbarMounted] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const autoPageSwitchRef = useRef(false);

  // Save to localStorage (client-side only)
  const saveToLocalStorage = useCallback(
    (content: string) => {
      if (typeof window === 'undefined') return;

      try {
        localStorage.setItem(
          pageStorageKey,
          JSON.stringify({
            content,
            lastSaved: new Date().toISOString(),
          })
        );
        if (draftBookId != null) {
          const unsavedKey = getBookPageLocalStorageKey(userId, null, page.id);
          if (unsavedKey !== pageStorageKey) {
            localStorage.removeItem(unsavedKey);
          }
        }
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
    },
    [pageStorageKey, draftBookId, userId, page.id]
  );

  const handleAutoSave = useCallback((content: string) => {
    saveToLocalStorage(content);
    onSave(content);
  }, [saveToLocalStorage, onSave]);

  const handleAutoSaveRef = useRef(handleAutoSave);
  handleAutoSaveRef.current = handleAutoSave;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Strike,
    ],
    content: page.content || '',
    editorProps: {
      attributes: {
        class: cn(
          'book-editor-prose prose prose-lg max-w-none focus:outline-none',
          embedded ? 'min-h-[400px]' : 'min-h-[min(560px,calc(100dvh-15rem))]'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      
      if (typeof window !== 'undefined') {
        const isOverLimit = isContentOverLimit(html);
        // Auto-switch to next page if content exceeds limit and page is not empty
        if (isOverLimit && !autoPageSwitchRef.current && html.trim().length > 0) {
          autoPageSwitchRef.current = true;
          
          // Clear any pending autosave
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          
          // Save current content first (immediate save)
          handleAutoSave(html);
          
          // Wait a bit then create new page and switch
          setTimeout(() => {
            onCreateNewPage();
            autoPageSwitchRef.current = false;
          }, 500);
          
          return; // Don't continue with autosave timeout
        }
      }
      
      // Debounced autosave
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        handleAutoSave(html);
      }, 2000); // 2 saniye debounce
    },
  });

  /** Bekleyen debounce’u iptal edip mevcut içeriği hemen store + localStorage’a yazar (sayfa geçişi / kapanış / unmount). */
  const flushEditorToStore = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = undefined;
    }
    if (!editor || editor.isDestroyed) return;
    handleAutoSaveRef.current(editor.getHTML());
  }, [editor]);

  /** Yalnızca başka sayfaya geçildiğinde içeriği store’dan yükle; autosave ile gelen `page.content` güncellemelerinde editörü sıfırlama (kaybolma / yanlış sayfa). */
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const nextContent = page.content || '';
    editor.commands.setContent(nextContent, false);
    autoPageSwitchRef.current = false;
  }, [editor, page.id]);

  /** Sayfa değişiminde: store boşsa yerel yedeği doldur; store doluysa sunucu/ store baskın (LS ile üzerine yazma). */
  useEffect(() => {
    if (typeof window === 'undefined' || !editor || editor.isDestroyed) return;

    const savedContent = readBookPageLocalStorageBackup(userId, draftBookId, page.id);
    if (!savedContent) return;
    try {
      const parsed = JSON.parse(savedContent);
      if (parsed?.content?.trim() && !page.content?.trim()) {
        editor.commands.setContent(parsed.content, false);
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
  }, [page.id, editor, userId, draftBookId]);

  const handleSave = async () => {
    if (!editor) return;
    const html = editor.getHTML();
    handleAutoSave(html);
    await saveDraft({ force: true });
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const url = reader.result as string;
          editor?.chain().focus().setImage({ src: url }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handlePrevious = () => {
    flushEditorToStore();
    if (pageIndex > 0) {
      const prevPage = allPages[pageIndex - 1];
      if (prevPage) onActivateWritePage(activeSectionId, prevPage.id);
    }
  };

  const handleNewPage = () => {
    flushEditorToStore();
    onCreateNewPage();
  };

  const handleAdvanceWizard = async () => {
    if (!canAdvanceWizard) return;
    flushEditorToStore();
    await Promise.resolve(onAdvanceWizard());
  };

  const handleClose = async () => {
    flushEditorToStore();
    await Promise.resolve(onClose());
  };

  // Tam ekrandan çıkınca veya sihirbaz başka adıma geçince son içeriği kaybetme
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = undefined;
      }
      // Editor henüz destroy edilmeden önce (TipTap cleanup sırası)
      const ed = editor;
      if (ed && !ed.isDestroyed) {
        handleAutoSaveRef.current(ed.getHTML());
      }
    };
  }, [editor]);

  useEffect(() => {
    setToolbarMounted(true);
  }, []);

  const handleSectionSwitch = (sectionId: number) => {
    if (sectionId === activeSectionId) return;
    flushEditorToStore();
    onActivateSection(sectionId);
  };

  const handleSectionSelectValue = (value: string) => {
    const id = Number(value);
    if (!Number.isFinite(id)) return;
    handleSectionSwitch(id);
  };

  const handlePagePickerChange = (value: string) => {
    const pageId = Number(value);
    if (!Number.isFinite(pageId) || pageId === page.id) return;
    const opt = currentSectionPagePickerOptions.find((o) => o.pageId === pageId);
    if (!opt) return;
    flushEditorToStore();
    onActivateWritePage(opt.sectionId, pageId);
  };

  if (!editor) {
    return null;
  }

  const pageCountInSection = Math.max(1, allPages.length);

  const toolbarBottomClass = reserveWizardFooter
    ? '!bottom-[calc(7.5rem+env(safe-area-inset-bottom))] !z-[100]'
    : '!bottom-[calc(4.75rem+env(safe-area-inset-bottom))] !z-[100]';

  const floatingToolbarNode = (
    <FloatingToolbar
      editor={editor}
      onImageUpload={handleImageUpload}
      isHovered={isToolbarHovered}
      onHoverChange={setIsToolbarHovered}
      className={!embedded ? toolbarBottomClass : undefined}
    />
  );

  return (
    <>
      <div
        className={cn(
          'bg-background flex flex-col',
          embedded
            ? 'relative z-0 w-full rounded-xl border border-border/50 shadow-sm min-h-[min(480px,calc(100vh-18rem))] max-h-[calc(100vh-11rem)]'
            : cn(
                'fixed inset-x-0 top-0 z-40 flex flex-col',
                reserveWizardFooter ? 'bottom-14' : 'bottom-0'
              )
        )}
      >
        {/* Üst tek satır: Sayfalar | bölüm seçici + Sayfa n/m | Kaydet İlerle */}
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 sticky top-0 z-20 shrink-0"
        >
          <div className="flex w-full items-center gap-2 sm:gap-3 px-3 py-2 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void handleClose()}
              className="shrink-0 gap-2 text-muted-foreground h-8"
              aria-label="Sayfalar adımına git"
            >
              <LayoutList className="h-4 w-4" />
              <span>Sayfalar</span>
            </Button>
            <div className="flex min-w-0 flex-1 items-center justify-center gap-0">
              <div className="min-w-0 max-w-[25ch] shrink">
                <Select
                  value={String(activeSectionId)}
                  onValueChange={handleSectionSelectValue}
                >
                  <SelectTrigger
                    className="h-8 w-full max-w-[25ch] min-w-0 border-border/80 bg-background/80 text-sm overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-left"
                    aria-label="Bölüm seçin"
                  >
                    <SelectValue placeholder="Bölüm seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedSections.map((sec) => (
                      <SelectItem key={sec.id} value={String(sec.id)}>
                        {sec.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="pl-2 text-muted-foreground tabular-nums shrink-0 text-xs sm:text-sm whitespace-nowrap">
                Sayfa {pageIndex + 1} / {pageCountInSection}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleSave()}
                disabled={draftSaving}
                className="h-8"
              >
                <Save className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline text-xs">{draftSaving ? 'Yazılıyor…' : 'Kaydet'}</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void handleAdvanceWizard()}
                disabled={!canAdvanceWizard || draftSaving}
                className="gap-1 h-8"
              >
                <span className="hidden sm:inline text-xs">İlerle</span>
                <ArrowRight className="h-4 w-4 sm:ml-0.5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Yazım alanı: tam genişlik, yatay padding sadece nefes */}
        <div className={cn('flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full', embedded && 'min-h-0')}>
          <div className="w-full max-w-none px-4 py-8 sm:px-8 sm:py-10 md:px-12 lg:px-16 xl:px-20">
            <EditorContent
              editor={editor}
              className="focus-within:outline-none w-full max-w-none [&_.ProseMirror]:max-w-none book-editor-content"
            />
          </div>
        </div>

        {/* Alt: önceki / yalnızca sayfa seçici / yeni sayfa */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-t border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 sticky bottom-0 z-20 shrink-0"
        >
          <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-2 sm:px-6">
            <div className="flex justify-start">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={pageIndex === 0}
                className="gap-1 text-muted-foreground px-2 sm:px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Önceki</span>
              </Button>
            </div>
            <div className="flex min-w-0 justify-center px-1">
              <Select value={String(page.id)} onValueChange={handlePagePickerChange}>
                <SelectTrigger
                  size="sm"
                  className="h-7 w-auto min-w-[11ch] max-w-[25ch] border-border/50 bg-muted/30 px-2.5 text-xs shadow-none overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:flex-1 [&_[data-slot=select-value]]:truncate [&_[data-slot=select-value]]:text-center"
                  aria-label="Bu bölümde sayfa seçin"
                >
                  <SelectValue placeholder="Sayfa" />
                </SelectTrigger>
                <SelectContent className="max-h-[min(60vh,320px)]">
                  {currentSectionPagePickerOptions.map((opt) => (
                    <SelectItem key={opt.pageId} value={String(opt.pageId)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleNewPage}
                className="gap-1 text-muted-foreground px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Yeni sayfa</span>
                <span className="sm:hidden text-base leading-none">+</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Floating toolbar: body’ye portal — sihirbaz alt çubuğu (z-45) üstünde görünsün */}
        {embedded && floatingToolbarNode}
      </div>
      {!embedded &&
        toolbarMounted &&
        typeof document !== 'undefined' &&
        createPortal(floatingToolbarNode, document.body)}
    </>
  );
}
