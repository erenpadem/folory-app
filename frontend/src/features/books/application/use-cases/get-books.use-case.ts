/**
 * Use Case: Get Books
 */
import { BookRepository, BookFilters } from '../../domain/repositories/book.repository.interface';
import { PaginatedResponse } from '../../domain/repositories/book.repository.interface';
import { BookEntity } from '../../domain/entities/book.entity';

export class GetBooksUseCase {
  constructor(private readonly bookRepository: BookRepository) {}

  async execute(filters?: BookFilters): Promise<PaginatedResponse<BookEntity>> {
    return await this.bookRepository.findAll(filters);
  }
}

