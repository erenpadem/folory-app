/**
 * Domain Entity: Chapter
 * Represents a chapter within a story
 */
export type StoryStatus = 'draft' | 'published' | 'archived' | 'pending_review';

export class ChapterEntity {
  constructor(
    public readonly id: string,
    public readonly storyId: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly content: string,
    public readonly position: number,
    public readonly wordCount: number,
    public readonly status: StoryStatus,
    public readonly viewCount: number,
    public readonly likesCount: number,
    public readonly commentsCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly publishedAt: Date | null
  ) {}

  get readingTime(): number {
    return Math.ceil(this.wordCount / 200);
  }

  get isPublished(): boolean {
    return this.status === 'published';
  }

  get canBePublished(): boolean {
    return this.title.length > 0 && this.content.length > 0;
  }

  canBeEdited(): boolean {
    return this.status !== 'archived';
  }

  static fromPrimitives(data: any): ChapterEntity {
    return new ChapterEntity(
      String(data.id),
      String(data.story_id),
      data.title,
      data.slug,
      data.content || '',
      data.position || 0,
      data.word_count || 0,
      data.status || 'draft',
      data.view_count || 0,
      data.likes_count || 0,
      data.comments_count || 0,
      data.created_at ? new Date(data.created_at) : new Date(),
      data.updated_at ? new Date(data.updated_at) : new Date(),
      data.published_at ? new Date(data.published_at) : null
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      story_id: this.storyId,
      title: this.title,
      slug: this.slug,
      content: this.content,
      position: this.position,
      word_count: this.wordCount,
      status: this.status,
      view_count: this.viewCount,
      likes_count: this.likesCount,
      comments_count: this.commentsCount,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      published_at: this.publishedAt?.toISOString() || null,
    };
  }
}

