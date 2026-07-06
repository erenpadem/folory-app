/**
 * Domain Entity: Book
 * Represents the core book domain model with business logic
 */
import { SectionEntity } from './section.entity';
import { pageHasWrittenContent } from '@/lib/page-content';

export class BookEntity {
  constructor(
    public readonly id: number,
    public readonly authorId: number,
    public readonly categoryId: number | null,
    public readonly title: string,
    public readonly shortDescription: string | null,
    public readonly cover: string | null,
    public readonly readCount: number,
    public readonly totalPage: number,
    public readonly isAdult: boolean,
    public readonly isDraft: boolean,
    public readonly isPublished: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly sections: SectionEntity[] = [],
    public readonly averageRating: number = 0,
    public readonly ratingCount: number = 0,
    public readonly authorName: string | null = null,
    public readonly authorUsername: string | null = null,
    public readonly viewerIsAuthor: boolean = false,
    public readonly slug?: string
  ) {}

  get canBePublished(): boolean {
    return (
      this.title.length > 0 &&
      this.sections.length > 0 &&
      this.sections.every(
        (section) =>
          section.pages.length > 0 &&
          section.pages.every((page) => pageHasWrittenContent(page.content))
      )
    );
  }

  get totalSections(): number {
    return this.sections.length;
  }

  /**
   * Sihirbazda ilk “eksik” adım (1–5). Sunucuda adım saklanmadığı için taslağı
   * dashboard’dan açınca içeriğe göre devam noktası belirlenir.
   */
  getResumeWizardStep(): number {
    if (!this.title.trim()) return 1;
    if (this.categoryId == null || this.categoryId === 0) return 1;
    if (this.sections.length === 0) return 2;
    for (const section of this.sections) {
      if (section.pages.length === 0) return 3;
    }
    const anyPageEmpty = this.sections.some((s) =>
      s.pages.some((p) => !pageHasWrittenContent(p.content))
    );
    if (anyPageEmpty) return 4;
    return 5;
  }

  static fromPrimitives(data: any): BookEntity {
    if (data == null || typeof data !== 'object') {
      throw new Error('Kitap verisi eksik veya geçersiz');
    }
    const avgRaw = data.average_rating;
    const averageRating =
      avgRaw != null && avgRaw !== '' && Number.isFinite(Number(avgRaw))
        ? Number(avgRaw)
        : 0;
    const ratingCount =
      data.rating_count != null && Number.isFinite(Number(data.rating_count))
        ? Number(data.rating_count)
        : 0;
    const authorName =
      data.author != null &&
      typeof data.author === 'object' &&
      data.author.name != null &&
      String(data.author.name).trim() !== ''
        ? String(data.author.name)
        : null;
    const authorUsername =
      data.author != null &&
      typeof data.author === 'object' &&
      data.author.username != null &&
      String(data.author.username).trim() !== ''
        ? String(data.author.username)
        : null;

    const isPublished = Boolean(data.is_published);
    const isDraft = isPublished
      ? false
      : data.is_draft !== undefined
        ? Boolean(data.is_draft)
        : true;

    return new BookEntity(
      Number(data.id),
      Number(data.author_id),
      data.category_id ? Number(data.category_id) : null,
      data.title,
      data.short_description || null,
      data.cover || null,
      data.read_count || 0,
      data.total_page || 0,
      data.is_adult || false,
      isDraft,
      isPublished,
      data.created_at ? new Date(data.created_at) : new Date(),
      data.updated_at ? new Date(data.updated_at) : new Date(),
      (data.sections || []).map((s: any) => SectionEntity.fromPrimitives(s)),
      averageRating,
      ratingCount,
      authorName,
      authorUsername,
      Boolean(data.viewer_is_author),
      data.slug
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      author_id: this.authorId,
      category_id: this.categoryId,
      title: this.title,
      short_description: this.shortDescription,
      cover: this.cover,
      read_count: this.readCount,
      total_page: this.totalPage,
      is_adult: this.isAdult,
      is_draft: this.isDraft,
      is_published: this.isPublished,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      sections: this.sections.map((s) => s.toPrimitives()),
      average_rating: this.averageRating,
      rating_count: this.ratingCount,
      author: this.authorName
        ? { name: this.authorName, username: this.authorUsername }
        : null,
    };
  }
}

