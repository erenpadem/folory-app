// app/api/stories/[id]/chapters/[chapterId]/route.ts
export async function PATCH(
    req: Request,
    { params }: { params: { id: string, chapterId: string } }
  ) {
    // Authentication check
    const { content, title } = await req.json()
    
    await prisma.chapter.update({
      where: { id: params.chapterId },
      data: { content, title }
    })
  
    return NextResponse.json({ success: true })
  }