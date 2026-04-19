'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type GridSchema = '2x2' | '2-top-1-bottom' | '3x1' | '1x3' | '1-left-2-right';

interface GridInsertModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (
    schema: GridSchema,
    cells: { type: 'text' | 'image'; text?: string; imageSrc?: string }[]
  ) => void;
}

export function GridInsertModal({ open, onClose, onInsert }: GridInsertModalProps) {
  const [schema, setSchema] = useState<GridSchema>('2x2');
  const [cells, setCells] = useState<{ type: 'text' | 'image'; text?: string; imageSrc?: string }[]>(
    [{ type: 'text' }, { type: 'text' }, { type: 'text' }, { type: 'text' }]
  );
  // Stepper: 1) schema, 2) cell types, 3) content
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const cellCount =
    schema === '2x2' ? 4 :
    schema === '2-top-1-bottom' ? 3 :
    schema === '3x1' ? 3 :
    schema === '1x3' ? 3 :
    schema === '1-left-2-right' ? 3 : 4;

  const handleTypeChange = (index: number, type: 'text' | 'image') => {
    const next = [...cells];
    next[index] = { type };
    setCells(next);
  };

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const handleInsert = () => {
    onInsert(schema, cells.slice(0, cellCount));
    onClose();
  };

  const handleTextChange = (index: number, value: string) => {
    const next = [...cells];
    next[index] = { ...next[index], text: value, type: 'text' };
    setCells(next);
  };

  const handleImageFile = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const next = [...cells];
      next[index] = { ...next[index], imageSrc: reader.result as string, type: 'image' };
      setCells(next);
    };
    reader.readAsDataURL(file);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-background rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col z-10 m-4 border"
        >
          <div className="border-b p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Grid yerleşimi ekle</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {step === 1 && '1/3 - Şablon seçin'}
                {step === 2 && '2/3 - Hücre türlerini seçin'}
                {step === 3 && '3/3 - İçerikleri girin'}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-4 space-y-4 overflow-auto scroll-soft max-h-[60vh]">
            {step === 1 && (
            <div>
              <p className="text-sm font-medium mb-2">Şablon seçin</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={`border rounded-lg p-3 text-sm hover:bg-accent/10 ${schema === '2x2' ? 'border-primary' : 'border-border'}`}
                  onClick={() => setSchema('2x2')}
                >
                  2 x 2
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="h-8 rounded-md border" />
                    <div className="h-8 rounded-md border" />
                    <div className="h-8 rounded-md border" />
                    <div className="h-8 rounded-md border" />
                  </div>
                </button>
                <button
                  className={`border rounded-lg p-3 text-sm hover:bg-accent/10 ${schema === '2-top-1-bottom' ? 'border-primary' : 'border-border'}`}
                  onClick={() => setSchema('2-top-1-bottom')}
                >
                  2 üstte, 1 altta
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-8 rounded-md border" />
                      <div className="h-8 rounded-md border" />
                    </div>
                    <div className="h-8 rounded-md border" />
                  </div>
                </button>
                <button
                  className={`border rounded-lg p-3 text-sm hover:bg-accent/10 ${schema === '3x1' ? 'border-primary' : 'border-border'}`}
                  onClick={() => setSchema('3x1')}
                >
                  3 sütun
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div className="h-8 rounded-md border" />
                    <div className="h-8 rounded-md border" />
                    <div className="h-8 rounded-md border" />
                  </div>
                </button>
                <button
                  className={`border rounded-lg p-3 text-sm hover:bg-accent/10 ${schema === '1x3' ? 'border-primary' : 'border-border'}`}
                  onClick={() => setSchema('1x3')}
                >
                  1 sütun
                  <div className="mt-2">
                    <div className="h-8 rounded-md border" />
                  </div>
                </button>
                <button
                  className={`border rounded-lg p-3 text-sm hover:bg-accent/10 ${schema === '1-left-2-right' ? 'border-primary' : 'border-border'}`}
                  onClick={() => setSchema('1-left-2-right')}
                >
                  1 sol, 2 sağ
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div className="h-8 rounded-md border col-span-1" />
                    <div className="h-8 rounded-md border col-span-2" />
                  </div>
                </button>
              </div>
            </div>
            )}

            {step === 2 && (
            <div>
              <p className="text-sm font-medium mb-2">Hücre türleri</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: cellCount }).map((_, idx) => {
                  const c = cells[idx] || { type: 'text' };
                  return (
                    <div key={idx} className="border rounded-lg p-3 space-y-2">
                      <p className="text-xs text-muted-foreground">Hücre {idx + 1}</p>
                      <div className="flex gap-2">
                        <Button
                          variant={c.type === 'text' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleTypeChange(idx, 'text')}
                        >
                          Yazı
                        </Button>
                        <Button
                          variant={c.type === 'image' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleTypeChange(idx, 'image')}
                        >
                          Resim
                        </Button>
                      </div>
                      {c.type === 'text' ? (
                        <textarea
                          className="w-full min-h-[80px] rounded-md border bg-background p-2 text-sm"
                          placeholder="Metin girin (isteğe bağlı)"
                          value={c.text || ''}
                          onChange={(e) => handleTextChange(idx, e.target.value)}
                        />
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageFile(idx, file);
                            }}
                          />
                          <input
                            type="text"
                            className="w-full rounded-md border bg-background p-2 text-sm"
                            placeholder="Resim URL'si (opsiyonel)"
                            value={c.imageSrc || ''}
                            onChange={(e) => {
                              const next = [...cells];
                              next[idx] = { ...next[idx], imageSrc: e.target.value, type: 'image' };
                              setCells(next);
                            }}
                          />
                          {c.imageSrc && (
                            <img src={c.imageSrc} alt="" className="max-h-24 rounded-md border object-contain" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            )}

            {step === 3 && (
            <div>
              <p className="text-sm font-medium mb-2">İçerikler</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: cellCount }).map((_, idx) => {
                  const c = cells[idx] || { type: 'text' };
                  return (
                    <div key={idx} className="border rounded-lg p-3 space-y-2">
                      <p className="text-xs text-muted-foreground">Hücre {idx + 1}</p>
                      {c.type === 'text' ? (
                        <textarea
                          className="w-full min-h-[120px] rounded-md border bg-background p-2 text-sm"
                          placeholder="Metin girin"
                          value={c.text || ''}
                          onChange={(e) => handleTextChange(idx, e.target.value)}
                        />
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageFile(idx, file);
                            }}
                          />
                          <input
                            type="text"
                            className="w-full rounded-md border bg-background p-2 text-sm"
                            placeholder="Resim URL'si (opsiyonel)"
                            value={c.imageSrc || ''}
                            onChange={(e) => {
                              const next = [...cells];
                              next[idx] = { ...next[idx], imageSrc: e.target.value, type: 'image' };
                              setCells(next);
                            }}
                          />
                          {c.imageSrc && (
                            <img src={c.imageSrc} alt="" className="max-h-24 rounded-md border object-contain" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            )}
          </div>

          <div className="border-t p-4 flex justify-between gap-2">
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>İptal</Button>
              {step > 1 && <Button variant="ghost" onClick={handleBack}>Geri</Button>}
            </div>
            <div className="flex gap-2">
              {step < 3 && <Button onClick={handleNext}>İleri</Button>}
              {step === 3 && <Button onClick={handleInsert}>Ekle</Button>}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

