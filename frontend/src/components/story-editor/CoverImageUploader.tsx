// components/story-editor/CoverImageUploader.tsx
'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Image as ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

export function CoverImageUploader({ 
  image, 
  onImageChange 
}: { 
  image: string | null, 
  onImageChange: (url: string | null) => void 
}) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    const reader = new FileReader()
    reader.onload = () => onImageChange(reader.result as string)
    reader.readAsDataURL(file)
  }, [onImageChange])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  })

  return (
    <div className="space-y-2">
      <Label>Kapak Resmi</Label>
      <div 
        {...getRootProps()}
        className="aspect-[3/4] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
      >
        <input {...getInputProps()} />
        {image ? (
          <div className="relative w-full h-full">
            <img 
              src={image} 
              alt="Cover" 
              className="w-full h-full object-cover rounded-lg"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 bg-background/80 rounded-full hover:bg-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onImageChange(null)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center p-4">
            <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Sürükle bırak veya tıkla</p>
            <p className="text-xs text-muted-foreground">(JPEG, PNG, WEBP)</p>
          </div>
        )}
      </div>
    </div>
  )
}