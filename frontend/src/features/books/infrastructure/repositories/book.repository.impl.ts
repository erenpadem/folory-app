/**
 * Infrastructure: Book Repository Implementation
 * Concrete implementation of book repository using API
 */
import {
  BookRepository,
  SectionRepository,
  PageRepository,
  BookFilters,
  PaginatedResponse,
} from '../../domain/repositories/book.repository.interface';
import { BookEntity } from '../../domain/entities/book.entity';
import { SectionEntity } from '../../domain/entities/section.entity';
import { PageEntity } from '../../domain/entities/page.entity';
import { BookApi } from '../api/book.api';
import { unwrapSingleResource } from '../api/unwrap-single-resource';

export class BookRepositoryImpl implements BookRepository, SectionRepository, PageRepository {
  constructor(private readonly bookApi: BookApi) {}

  async findAll(filters?: BookFilters): Promise<PaginatedResponse<BookEntity>> {
    const response = await this.bookApi.getBooks(filters);
    return {
      data: response.data.map((book) => BookEntity.fromPrimitives(book)),
      meta: response.meta,
    };
  }

  async findById(id: number): Promise<BookEntity | null> {
    try {
      const response = await this.bookApi.getBookById(id);
      const bookPayload = unwrapSingleResource(response.data ?? response);
      return BookEntity.fromPrimitives(bookPayload);
    } catch (error) {
      return null;
    }
  }

  async findByUserId(userId: number, filters?: BookFilters): Promise<PaginatedResponse<BookEntity>> {
    const response = await this.bookApi.getUserBooks({ ...filters, author_id: userId });
    return {
      data: response.data.map((book) => BookEntity.fromPrimitives(book)),
      meta: response.meta,
    };
  }

  async create(book: Partial<BookEntity>): Promise<BookEntity> {
    const response = await this.bookApi.createBook({
      title: book.title || '',
      short_description: book.shortDescription || undefined,
      category_id: book.categoryId || undefined,
      is_adult: book.isAdult || false,
      is_draft: book.isDraft !== undefined ? book.isDraft : true,
    });
    const bookPayload = unwrapSingleResource(response.data ?? response);
    return BookEntity.fromPrimitives(bookPayload);
  }

  async update(id: number, book: Partial<BookEntity>): Promise<BookEntity> {
    const response = await this.bookApi.updateBook(id, {
      title: book.title,
      short_description: book.shortDescription,
      category_id: book.categoryId || undefined,
      is_adult: book.isAdult,
      is_draft: book.isDraft,
    });
    const bookPayload = unwrapSingleResource(response.data ?? response);
    return BookEntity.fromPrimitives(bookPayload);
  }

  async delete(id: number): Promise<void> {
    await this.bookApi.deleteBook(id);
  }

  async publish(id: number): Promise<BookEntity> {
    const response = await this.bookApi.publishBook(id);
    const bookPayload = unwrapSingleResource(response.data ?? response);
    return BookEntity.fromPrimitives(bookPayload);
  }

  async findSimilar(bookId: number): Promise<BookEntity[]> {
    const response = await this.bookApi.getSimilarBooks(bookId);
    return response.data.map((book) => BookEntity.fromPrimitives(book));
  }

  // Section Repository Implementation
  async findByBookId(bookId: number): Promise<SectionEntity[]> {
    const response = await this.bookApi.getSections(bookId);
    return response.data.map((section) => SectionEntity.fromPrimitives(section));
  }

  async findById(id: number): Promise<SectionEntity | null> {
    // Note: This would need a separate endpoint or we fetch all and filter
    // For now, we'll need to implement a getSectionById endpoint in the API
    return null;
  }

  async create(bookId: number, section: Partial<SectionEntity>): Promise<SectionEntity> {
    const response = await this.bookApi.createSection(bookId, {
      title: section.title || '',
      order: section.order,
      is_visible: section.isVisible,
    });
    const sectionPayload = unwrapSingleResource(response.data ?? response);
    return SectionEntity.fromPrimitives(sectionPayload);
  }

  async update(id: number, section: Partial<SectionEntity>): Promise<SectionEntity> {
    // We need bookId for the endpoint, so we'll need to pass it or store it
    // For now, assuming we have bookId from the section
    const response = await this.bookApi.updateSection(section.bookId || 0, id, {
      title: section.title,
      order: section.order,
      is_visible: section.isVisible,
    });
    const sectionPayload = unwrapSingleResource(response.data ?? response);
    return SectionEntity.fromPrimitives(sectionPayload);
  }

  async delete(id: number): Promise<void> {
    // We need bookId for the endpoint
    // This is a limitation - we should refactor to pass bookId
    throw new Error('Delete section requires bookId');
  }

  async reorder(bookId: number, sectionOrders: { id: number; order: number }[]): Promise<void> {
    await this.bookApi.reorderSections(bookId, { sections: sectionOrders });
  }

  // Page Repository Implementation
  async findBySectionId(sectionId: number): Promise<PageEntity[]> {
    const response = await this.bookApi.getPages(sectionId);
    return response.data.map((page) => PageEntity.fromPrimitives(page));
  }

  async findById(id: number): Promise<PageEntity | null> {
    return null; // Would need separate endpoint
  }

  async create(sectionId: number, page: Partial<PageEntity>): Promise<PageEntity> {
    const response = await this.bookApi.createPage(sectionId, {
      content: page.content || '',
      order: page.order,
    });
    const pagePayload = unwrapSingleResource(response.data ?? response);
    return PageEntity.fromPrimitives(pagePayload);
  }

  async update(id: number, page: Partial<PageEntity>): Promise<PageEntity> {
    const response = await this.bookApi.updatePage(page.sectionId || 0, id, {
      content: page.content,
      order: page.order,
    });
    const pagePayload = unwrapSingleResource(response.data ?? response);
    return PageEntity.fromPrimitives(pagePayload);
  }

  async delete(id: number): Promise<void> {
    throw new Error('Delete page requires sectionId');
  }
}

