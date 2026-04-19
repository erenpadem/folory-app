'use client';

import { useState, useRef } from 'react';
import { useBookEditorStore } from '../../stores/book-editor.store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/lib/api-client';
import { Upload, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export function BookInfoStep() {
  const { bookInfo, updateBookInfo } = useBookEditorStore();
  const [coverPreview, setCoverPreview] = useState<string | null>(bookInfo.cover);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useQuery<{ data: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCoverPreview(result);
        updateBookInfo({ cover: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCover = () => {
    setCoverPreview(null);
    updateBookInfo({ cover: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Cover Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Label className="text-lg font-semibold mb-4 block">Kapak Resmi</Label>
        <AnimatePresence mode="wait">
          {coverPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative group"
            >
              <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRemoveCover}
                  className="absolute top-4 right-4 bg-destructive text-destructive-foreground rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card
                className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="p-12 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-block mb-4"
                  >
                    <Upload className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors mx-auto" />
                  </motion.div>
                  <p className="text-lg font-medium mb-2">Kapak resmi yükleyin</p>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG veya GIF (max. 10MB)
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />
      </motion.div>

      {/* Book Info Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div>
          <Label htmlFor="title" className="text-lg font-semibold">
            Kitap Başlığı *
          </Label>
          <Input
            id="title"
            value={bookInfo.title}
            onChange={(e) => updateBookInfo({ title: e.target.value })}
            placeholder="Örn: Yıldızlar Arasında Yolculuk"
            className="mt-2 h-14 text-lg"
          />
        </div>

        <div>
          <Label htmlFor="shortDescription" className="text-lg font-semibold">
            Kısa Açıklama
          </Label>
          <Textarea
            id="shortDescription"
            value={bookInfo.shortDescription}
            onChange={(e) => updateBookInfo({ shortDescription: e.target.value })}
            placeholder="Kitabınız hakkında kısa ve etkileyici bir açıklama yazın..."
            className="mt-2 min-h-32 text-base"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <Label htmlFor="category" className="text-lg font-semibold mb-2">
              Kategori *
            </Label>
            <Select
              required
              value={bookInfo.categoryId?.toString() || ''}
              onValueChange={(value) =>
                updateBookInfo({ categoryId: value ? Number(value) : null })
              }
            >
              <SelectTrigger id="category" className="flex-1 h-14">
                <SelectValue placeholder="Kategori seçin (zorunlu)" />
              </SelectTrigger>
              <SelectContent>
                {categories?.data?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <Label htmlFor="isAdult" className="text-lg font-semibold mb-2">
              İçerik Uyarısı
            </Label>
            <div className="flex items-center space-x-3 p-4 rounded-lg border bg-card flex-1 h-14">
              <Switch
                id="isAdult"
                checked={bookInfo.isAdult}
                onCheckedChange={(checked) => updateBookInfo({ isAdult: checked })}
              />
              <Label htmlFor="isAdult" className="text-base font-medium cursor-pointer flex-1">
                +18 İçerik
              </Label>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
