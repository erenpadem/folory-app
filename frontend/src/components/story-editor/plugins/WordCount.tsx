// components/story-editor/plugins/WordCountPlugin.ts
import { Extension } from '@tiptap/core'

export interface WordCountOptions {
  onUpdate: ({ words }: { words: number }) => void
}

export const WordCountPlugin = Extension.create<WordCountOptions>({
  name: 'wordCount',

  addOptions() {
    return {
      onUpdate: () => {},
    }
  },

  onUpdate() {
    const editor = this.editor
    const text = editor.getText()
    const words = text.trim() ? text.split(/\s+/).length : 0
    this.options.onUpdate({ words })
  },
})