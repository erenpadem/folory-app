'use client';

import { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Quote,
  Image as ImageIcon,
  LayoutGrid,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GridInsertModal } from './grid-insert-modal';

interface FloatingToolbarProps {
  editor: Editor | null;
  onImageUpload: () => void;
  isHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
  /** Örn. sihirbaz alt çubuğu + sayfa çubuğu üstünde kalsın diye bottom/z-index */
  className?: string;
}

export function FloatingToolbar({
  editor,
  onImageUpload,
  isHovered,
  onHoverChange,
  className,
}: FloatingToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [gridModalOpen, setGridModalOpen] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const { from, to } = editor.state.selection;
      // Show toolbar when there's a selection or when editor is focused
      setIsVisible(from !== to || editor.isFocused);
    };

    const handleFocus = () => {
      setIsVisible(true);
    };

    const handleBlur = () => {
      // Keep visible if there's a selection
      const { from, to } = editor.state.selection;
      setIsVisible(from !== to);
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('focus', handleFocus);
    editor.on('blur', handleBlur);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('focus', handleFocus);
      editor.off('blur', handleBlur);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isVisible ? (isHovered ? 1 : 0.92) : 0,
        y: isVisible ? 0 : 20,
        scale: isHovered ? 1 : 0.98,
      }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className={cn(
        'fixed left-1/2 -translate-x-1/2 z-50 bottom-8',
        className
      )}
    >
      <div className="bg-background/95 backdrop-blur-xl border rounded-full shadow-2xl px-3 py-2 flex items-center gap-1">
        {/* Text Formatting */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 rounded-full',
            editor.isActive('bold') && 'bg-primary text-primary-foreground'
          )}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 rounded-full',
            editor.isActive('italic') && 'bg-primary text-primary-foreground'
          )}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 rounded-full',
            editor.isActive('underline') && 'bg-primary text-primary-foreground'
          )}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 rounded-full',
            editor.isActive('strike') && 'bg-primary text-primary-foreground'
          )}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Üstü çizili"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Headings */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 rounded-full',
            editor.isActive('heading', { level: 1 }) && 'bg-primary text-primary-foreground'
          )}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 rounded-full',
            editor.isActive('heading', { level: 2 }) && 'bg-primary text-primary-foreground'
          )}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Quote */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 rounded-full',
            editor.isActive('blockquote') && 'bg-primary text-primary-foreground'
          )}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Alignment */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 rounded-full',
            editor.isActive({ textAlign: 'left' }) && 'bg-primary text-primary-foreground'
          )}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 rounded-full',
            editor.isActive({ textAlign: 'center' }) && 'bg-primary text-primary-foreground'
          )}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 rounded-full',
            editor.isActive({ textAlign: 'right' }) && 'bg-primary text-primary-foreground'
          )}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Media */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={onImageUpload}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => {
            setGridModalOpen(true);
          }}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
    <GridInsertModal
      open={gridModalOpen}
      onClose={() => setGridModalOpen(false)}
      onInsert={(schema, cells) => {
        if (!editor) return;
        const buildCell = (cell: { type: 'text' | 'image'; text?: string; imageSrc?: string }) => {
          if (cell.type === 'image') {
            return `
              <div class="rounded-md border p-2 min-h-[140px] flex items-center justify-center overflow-auto resize">
                <img src="${cell.imageSrc || ''}" alt="" class="max-w-full max-h-60 object-contain" />
              </div>
            `;
          }
          return `
            <div class="rounded-md border p-3 min-h-[140px] overflow-auto resize">
              <p class="text-sm">${cell.text ? cell.text.replace(/</g,'&lt;').replace(/>/g,'&gt;') : 'Yazı ekleyin…'}</p>
            </div>
          `;
        };
        let html = '';
        if (schema === '2x2') {
          html = `
            <div class="grid grid-cols-2 gap-4 my-4">
              ${buildCell(cells[0])}
              ${buildCell(cells[1])}
              ${buildCell(cells[2])}
              ${buildCell(cells[3])}
            </div>
          `;
        } else if (schema === '2-top-1-bottom') {
          html = `
            <div class="my-4 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                ${buildCell(cells[0])}
                ${buildCell(cells[1])}
              </div>
              ${buildCell(cells[2])}
            </div>
          `;
        } else if (schema === '3x1') {
          html = `
            <div class="grid grid-cols-3 gap-4 my-4">
              ${buildCell(cells[0])}
              ${buildCell(cells[1])}
              ${buildCell(cells[2])}
            </div>
          `;
        } else if (schema === '1x3') {
          html = `
            <div class="my-4">
              ${buildCell(cells[0])}
            </div>
          `;
        } else if (schema === '1-left-2-right') {
          html = `
            <div class="grid grid-cols-3 gap-4 my-4">
              <div class="col-span-1">
                ${buildCell(cells[0])}
              </div>
              <div class="col-span-2">
                <div class="grid grid-cols-2 gap-4">
                  ${buildCell(cells[1])}
                  ${buildCell(cells[2])}
                </div>
              </div>
            </div>
          `;
        }
        editor.chain().focus().insertContent(html).run();
      }}
    />
    </>
  );
}

