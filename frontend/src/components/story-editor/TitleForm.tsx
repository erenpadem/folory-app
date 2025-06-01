import React from 'react'
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

export const TitleForm = () => (
    <div className="space-y-2">
      <Label htmlFor="title">Hikaye Başlığı</Label>
      <Input
        id="title"
        placeholder="Hikayenizin başlığını girin"
      />
      <Label htmlFor="description">Kısa Açıklama</Label>
      <Textarea
        id="description"
        placeholder="Hikayenizin kısa tanımını yazın"
        rows={3}
      />
    </div>
  )

