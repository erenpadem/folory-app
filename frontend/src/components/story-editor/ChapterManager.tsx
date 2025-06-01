// components/story-editor/ChapterManager.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, GripVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd'

type Chapter = {
  id: string
  title: string
  content: string
  wordCount: number
}

export function ChapterManager({
  chapters,
  onChaptersChange,
  onSelectChapter
}: {
  chapters: Chapter[]
  onChaptersChange: (chapters: Chapter[]) => void
  onSelectChapter: (id: string) => void
}) {
  const addChapter = () => {
    const newChapter = {
      id: `ch-${Date.now()}`,
      title: `Bölüm ${chapters.length + 1}`,
      content: '',
      wordCount: 0
    }
    onChaptersChange([...chapters, newChapter])
    onSelectChapter(newChapter.id)
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    
    const items = Array.from(chapters)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    onChaptersChange(items)
  }

  return (
    <div className="space-y-4">
      <Button onClick={addChapter} className="gap-2 w-full">
        <Plus className="h-4 w-4" />
        Yeni Bölüm Ekle
      </Button>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="chapters">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef} 
              className="space-y-2"
            >
              {chapters.map((chapter, index) => (
                <Draggable key={chapter.id} draggableId={chapter.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors"
                    >
                      <div {...provided.dragHandleProps}>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => onSelectChapter(chapter.id)}
                      >
                        <h3 className="font-medium">{chapter.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {chapter.wordCount} kelime
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onSelectChapter(chapter.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="hover:text-destructive"
                        onClick={() => onChaptersChange(chapters.filter(ch => ch.id !== chapter.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}