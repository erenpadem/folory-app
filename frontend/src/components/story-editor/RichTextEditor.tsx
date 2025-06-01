// components/story-editor/RichTextEditor.tsx
'use client'

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Typography from '@tiptap/extension-typography'
import Image from '@tiptap/extension-image'
import { Toolbar } from './EditorToolbar'
import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ImageUploadDialog } from './ImageUploadDialog'
import { useDebouncedCallback } from 'use-debounce'
import { WordCountPlugin } from './plugins/WordCount'

export function RichTextEditor({
  content,
  onUpdate,
  placeholder = 'Hikayeni yazmaya başla...',
  wordCountGoal = 2000,
}: {
  content: string
  onUpdate: (html: string) => void
  placeholder?: string
  wordCountGoal?: number
}) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)

  const debouncedUpdate = useDebouncedCallback((html: string) => {
    onUpdate(html)
  }, 1000)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextAlign.configure({
        types: ['paragraph', 'heading'],
      }),
      Typography,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      CharacterCount.configure({
        onUpdate: ({ stats }) => {
          setCharCount(stats.characters)
        },
      }),
      WordCountPlugin.configure({
        onUpdate: ({ words }) => {
          setWordCount(words)
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      debouncedUpdate(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none',
      },
    },
  })

  const addImage = (url: string) => {
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
    setIsImageDialogOpen(false)
  }

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return <div className="border rounded-lg p-4 min-h-[300px]">Editör yükleniyor...</div>
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden bg-background">
        <Toolbar 
          editor={editor} 
          onImageUpload={() => setIsImageDialogOpen(true)}
        />
        
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex bg-background border rounded-lg shadow-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-accent' : ''}
              >
                <span className="font-bold">B</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-accent' : ''}
              >
                <span className="italic">İ</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'bg-accent' : ''}
              >
                <span className="underline">A</span>
              </Button>
            </div>
          </BubbleMenu>
        )}

        <EditorContent
          editor={editor}
          className="min-h-[300px] p-4 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{wordCount} kelime • {charCount} karakter</span>
          <span>Hedef: {wordCountGoal} kelime</span>
        </div>
        <Progress 
          value={Math.min((wordCount / wordCountGoal) * 100, 100)} 
          className="h-2"
        />
      </div>

      <ImageUploadDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        onUpload={addImage}
      />
    </div>
  )
}