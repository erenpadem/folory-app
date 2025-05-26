export type Story = {
    id: number
    title: string
    author: string
    cover: string
    likes: number
    chapters: number
    genre: string
    updated: string
    description: string
    status?: 'ongoing' | 'completed' | 'hiatus'
  }