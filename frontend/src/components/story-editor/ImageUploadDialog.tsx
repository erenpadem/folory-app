// components/story-editor/ImageUploadDialog.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDropzone } from 'react-dropzone'
import { ImagePlus, Link, Upload } from 'lucide-react'

export function ImageUploadDialog({
  open,
  onOpenChange,
  onUpload,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (url: string) => void
}) {
  const [imageUrl, setImageUrl] = useState('')
  const [tab, setTab] = useState<'upload' | 'url'>('upload')

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      const reader = new FileReader()
      reader.onload = () => {
        setImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resim Ekle</DialogTitle>
          <DialogDescription>
            URL veya bilgisayarınızdan resim yükleyin
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            variant={tab === 'upload' ? 'default' : 'outline'}
            onClick={() => setTab('upload')}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Yükle
          </Button>
          <Button
            variant={tab === 'url' ? 'default' : 'outline'}
            onClick={() => setTab('url')}
            className="gap-2"
          >
            <Link className="h-4 w-4" />
            URL
          </Button>
        </div>

        {tab === 'upload' ? (
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
          >
            <input {...getInputProps()} />
            <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Resmi sürükleyip bırakın veya tıklayın
            </p>
            {imageUrl && (
              <div className="mt-4">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-h-40 mx-auto rounded"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="image-url">Resim URL'si</Label>
            <Input
              id="image-url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            İptal
          </Button>
          <Button
            onClick={() => {
              onUpload(imageUrl)
              setImageUrl('')
            }}
            disabled={!imageUrl}
          >
            Ekle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}