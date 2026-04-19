/**
 * Use Case: Publish Book
 */
import { BookRepository } from '../../domain/repositories/book.repository.interface';
import { BookEntity } from '../../domain/entities/book.entity';

export class PublishBookUseCase {
  constructor(private readonly bookRepository: BookRepository) {}

  async execute(bookId: number): Promise<BookEntity> {
    return await this.bookRepository.publish(bookId);
  }
}

