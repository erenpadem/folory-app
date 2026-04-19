/**
 * Use Case: Create Book
 * Application logic for creating a new book
 */
import { BookRepository } from '../../domain/repositories/book.repository.interface';
import { BookEntity } from '../../domain/entities/book.entity';
import { CreateBookRequestDto } from '../dto/book.dto';

export class CreateBookUseCase {
  constructor(private readonly bookRepository: BookRepository) {}

  async execute(request: CreateBookRequestDto): Promise<BookEntity> {
    if (!request.title || request.title.trim().length === 0) {
      throw new Error('Book title is required');
    }
    if (request.category_id == null || request.category_id < 1) {
      throw new Error('Kategori seçimi zorunludur');
    }

    const bookData = {
      title: request.title,
      shortDescription: request.short_description || null,
      categoryId: request.category_id || null,
      isAdult: request.is_adult || false,
      isDraft: request.is_draft !== undefined ? request.is_draft : true,
    };

    return await this.bookRepository.create(bookData);
  }
}

