// app/api/stories/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) return new NextResponse('Unauthorized', { status: 401 })

    const body = await req.json()
    
    const story = await prisma.story.create({
      data: {
        userId,
        title: body.title,
        description: body.description,
        genre: body.genre,
        isPublished: body.isPublished,
        tags: body.tags
      }
    })

    return NextResponse.json(story)
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}