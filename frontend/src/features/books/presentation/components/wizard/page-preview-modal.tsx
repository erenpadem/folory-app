'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface PagePreviewModalProps {
  content: string;
  bookTitle: string;
  sectionTitle: string;
  onClose: () => void;
}

export function PagePreviewModal({
  content,
  bookTitle,
  sectionTitle,
  onClose,
}: PagePreviewModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current && content) {
      // Clear previous content
      contentRef.current.innerHTML = '';
      
      // Create a temporary container to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      // Move all nodes to the actual container
      // This ensures HTML is properly rendered, not shown as text
      while (tempDiv.firstChild) {
        contentRef.current.appendChild(tempDiv.firstChild);
      }
      
      // Ensure all heading tags are properly styled and visible
      const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach((heading) => {
        heading.style.display = 'block';
        if (heading.tagName === 'H1') {
          heading.style.fontSize = '2.5em';
          heading.style.fontWeight = '700';
          heading.style.marginTop = '0';
          heading.style.marginBottom = '1em';
          heading.style.lineHeight = '1.2';
        }
      });
      
      // Ensure paragraphs are properly styled
      const paragraphs = contentRef.current.querySelectorAll('p');
      paragraphs.forEach((p) => {
        p.style.display = 'block';
        p.style.marginBottom = '1.5em';
        p.style.lineHeight = '1.75';
      });
      
      // Ensure blockquotes are properly styled
      const blockquotes = contentRef.current.querySelectorAll('blockquote');
      blockquotes.forEach((bq) => {
        bq.style.display = 'block';
        bq.style.margin = '2em 0';
        bq.style.paddingLeft = '1.5em';
        bq.style.borderLeft = '4px solid var(--border)';
        bq.style.fontStyle = 'italic';
      });
      
      // Ensure lists are properly styled
      const lists = contentRef.current.querySelectorAll('ul, ol');
      lists.forEach((list) => {
        list.style.display = 'block';
        list.style.margin = '1.5em 0';
        list.style.paddingLeft = '2em';
      });
      
      // Ensure images are properly styled
      const images = contentRef.current.querySelectorAll('img');
      images.forEach((img) => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = 'var(--radius)';
        img.style.margin = '1.5em 0';
      });
    }
  }, [content]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-background rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col z-10 m-4"
        >
          {/* Header */}
          <div className="border-b p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{bookTitle}</h2>
              <p className="text-sm text-muted-foreground mt-1">{sectionTitle}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div
              ref={contentRef}
              className="prose prose-lg max-w-none dark:prose-invert"
              style={{
                lineHeight: '1.75',
              }}
            />
          </div>

          {/* Footer */}
          <div className="border-t p-4 flex justify-end">
            <Button onClick={onClose}>Kapat</Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

