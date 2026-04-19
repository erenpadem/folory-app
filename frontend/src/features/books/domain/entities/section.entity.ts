/**
 * Domain Entity: Section
 */
import { PageEntity } from './page.entity';

export class SectionEntity {
  constructor(
    public readonly id: number,
    public readonly bookId: number,
    public readonly title: string,
    public readonly order: number,
    public readonly totalPage: number,
    public readonly isVisible: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly pages: PageEntity[] = []
  ) {}

  static fromPrimitives(data: any): SectionEntity {
    return new SectionEntity(
      Number(data.id),
      Number(data.book_id),
      data.title,
      data.order || 0,
      data.total_page || 0,
      data.is_visible !== undefined ? data.is_visible : true,
      data.created_at ? new Date(data.created_at) : new Date(),
      data.updated_at ? new Date(data.updated_at) : new Date(),
      (data.pages || [])
        .filter((p: unknown) => p != null && typeof p === 'object')
        .map((p: any) => PageEntity.fromPrimitives(p))
    );
  }

  toPrimitives() {
    return {
      id: this.id,
      book_id: this.bookId,
      title: this.title,
      order: this.order,
      total_page: this.totalPage,
      is_visible: this.isVisible,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
      pages: this.pages.map((p) => p.toPrimitives()),
    };
  }
}

