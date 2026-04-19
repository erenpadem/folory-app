/**
 * Books Feature Public API
 * Exports only what's needed from outside the feature
 */
export { BookEntity } from './domain/entities/book.entity';
export { SectionEntity } from './domain/entities/section.entity';
export { PageEntity } from './domain/entities/page.entity';
export type {
  BookFiltersDto,
  CreateBookRequestDto,
  UpdateBookRequestDto,
  CreateSectionRequestDto,
  CreatePageRequestDto,
} from './application/dto/book.dto';

