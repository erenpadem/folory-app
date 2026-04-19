/**
 * Repository Interface (Port)
 * Defines the contract for book persistence operations
 */
import { BookEntity } from '../entities/book.entity';
import { SectionEntity } from '../entities/section.entity';
import { PageEntity } from '../entities/page.entity';

export interface BookFilters {
  page?: number;
  per_page?: number;
  category_id?: number;
  is_published?: boolean;
  author_id?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface BookRepository {
  findAll(filters?: BookFilters): Promise<PaginatedResponse<BookEntity>>;
  findById(id: number): Promise<BookEntity | null>;
  findByUserId(userId: number, filters?: BookFilters): Promise<PaginatedResponse<BookEntity>>;
  create(book: Partial<BookEntity>): Promise<BookEntity>;
  update(id: number, book: Partial<BookEntity>): Promise<BookEntity>;
  delete(id: number): Promise<void>;
  publish(id: number): Promise<BookEntity>;
  findSimilar(bookId: number): Promise<BookEntity[]>;
}

export interface SectionRepository {
  findByBookId(bookId: number): Promise<SectionEntity[]>;
  findById(id: number): Promise<SectionEntity | null>;
  create(bookId: number, section: Partial<SectionEntity>): Promise<SectionEntity>;
  update(id: number, section: Partial<SectionEntity>): Promise<SectionEntity>;
  delete(id: number): Promise<void>;
  reorder(bookId: number, sectionOrders: { id: number; order: number }[]): Promise<void>;
}

export interface PageRepository {
  findBySectionId(sectionId: number): Promise<PageEntity[]>;
  findById(id: number): Promise<PageEntity | null>;
  create(sectionId: number, page: Partial<PageEntity>): Promise<PageEntity>;
  update(id: number, page: Partial<PageEntity>): Promise<PageEntity>;
  delete(id: number): Promise<void>;
}

