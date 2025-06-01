// app/api/stories/[id]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const story = await prisma.story.findUnique({
      where: {
        id: params.id,
        authorId: userId
      },
      include: {
        chapters: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!story) {
      return new NextResponse('Story not found', { status: 404 })
    }

    return NextResponse.json(story)
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth()
  const body = await request.json()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { title, description, coverImage, tags, category, chapters, status } = body

    // Önce hikayeyi güncelle
    const updatedStory = await prisma.story.update({
      where: {
        id: params.id,
        authorId: userId
      },
      data: {
        title,
        description,
        coverImage,
        tags,
        category,
        status
      }
    })

    // Sonra bölümleri güncelle/sil/ekle
    await Promise.all(
      chapters.map(async (chapter: any) => {
        if (chapter.id.startsWith('ch-')) {
          // Yeni bölüm
          await prisma.chapter.create({
            data: {
              title: chapter.title,
              content: chapter.content,
              wordCount: chapter.wordCount,
              status: chapter.status,
              storyId: params.id
            }
          })
        } else {
          // Var olan bölüm
          await prisma.chapter.update({
            where: {
              id: chapter.id,
              storyId: params.id
            },
            data: {
              title: chapter.title,
              content: chapter.content,
              wordCount: chapter.wordCount,
              status: chapter.status
            }
          })
        }
      })
    )

    // Silinen bölümleri temizle
    const existingChapterIds = chapters
      .filter((ch: any) => !ch.id.startsWith('ch-'))
      .map((ch: any) => ch.id)
    
    await prisma.chapter.deleteMany({
      where: {
        storyId: params.id,
        NOT: {
          id: {
            in: existingChapterIds
          }
        }
      }
    })

    return NextResponse.json(updatedStory)
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}