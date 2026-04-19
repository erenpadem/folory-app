/**
 * Domain Entity: Story
 * Represents the core story domain model with business logic
 */
import { ChapterEntity } from './chapter.entity';

export type StoryStatus = 'draft' | 'published' | 'archived' | 'pending_review';
export type ContentRating = 'general' | 'teen' | 'mature' | 'explicit';

export class StoryEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly slug: string,
    public readonly title: string,
    public readonly description: string,
    public readonly shortDescription: string | null,
    public readonly coverImage: string | null,
    public readonly wordCount: number,
    public readonly status: StoryStatus,
    public readonly isFeatured: boolean,
    public readonly isAdult: boolean,
    public readonly contentRating: ContentRating,
    public readonly isApproved: boolean,
    public readonly viewCount: number,
    public readonly uniqueViews: number,
    public readonly rating: number,
    public readonly likesCount: number,
    public readonly commentsCount: number,
    public readonly bookmarksCount: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly publishedAt: Date | null,
    public readonly categoryId: string | null,
    public readonly genreIds: string[],
    public readonly tags: string[],
    public readonly chapters: any[] = []
  ) {}

  get readingTime(): number {
    return Math.ceil(this.wordCount / 200); // Average reading speed: 200 words/min
  }

  get isPublished(): boolean {
    return this.status === 'published' && this.isApproved;
  }

  get canBePublished(): boolean {
    return (
      this.title.length > 0 &&
      this.description.length > 0 &&
      this.chapters.length > 0 &&
      this.chapters.some((ch) => ch.isPublished)
    );
  }

  get publishedChapterCount(): number {
    return this.chapters.filter((ch) => ch.isPublished).length;
  }

  canBeEdited(): boolean {
    return this.status !== 'archived';
  }

  canBeDeleted(): boolean {
    return this.status === 'draft' || this.status === 'archived';
  }

  static fromPrimitives(data: any): StoryEntity {
    return new StoryEntity(
      String(data.id),
      String(data.user_id),
      data.slug,
      data.title,
      data.description,
      data.short_description || null,
      data.cover_image || null,
      data.word_count || 0,
      data.status,
      data.is_featured || false,
      data.is_adult || false,
      data.content_rating || 'general',
      data.is_approved || false,
      data.view_count || 0,
      data.unique_views || 0,
      data.rating || 0,
      data.likes_count || 0,
      data.comments_count || 0,
      data.bookmarks_count || 0,
      data.created_at ? new Date(data.created_at) : new Date(),
      data.updated_at ? new Date(data.updated_at) : new Date(),
      data.published_at ? new Date(data.published_at) : null,
      data.category_id || null,
      data.genre_ids || [],
      data.tags || [],
      []
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      user_id: this.userId,
      slug: this.slug,
      title: this.title,
      description: this.description,
      short_description: this.shortDescription,
      cover_image: this.coverImage,
      word_count: this.wordCount,
      status: this.status,
      is_featured: this.isFeatured,
      is_adult: this.isAdult,
      content_rating: this.contentRating,
      is_approved: this.isApproved,
      view_count: this.viewCount,
      unique_views: this.uniqueViews,
      rating: this.rating,
      likes_count: this.likesCount,
      comments_count: this.commentsCount,
      bookmarks_count: this.bookmarksCount,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      published_at: this.publishedAt?.toISOString() || null,
      category_id: this.categoryId,
      genre_ids: this.genreIds,
      tags: this.tags,
      chapters: this.chapters.map((ch) => ch.toPrimitives()),
    };
  }
}

