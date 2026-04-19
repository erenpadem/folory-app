/**
 * Data Transfer Objects (DTOs)
 * Used for data transfer between layers
 */
import { BookEntity } from '../../domain/entities/book.entity';
import { SectionEntity } from '../../domain/entities/section.entity';
import { PageEntity } from '../../domain/entities/page.entity';
import { PaginatedResponse } from '../../domain/repositories/book.repository.interface';

export interface BookListResponseDto extends PaginatedResponse<BookEntity> {}
export interface BookDetailResponseDto {
  data: BookEntity;
}

export interface CreateBookRequestDto {
  title: string;
  short_description?: string;
  cover?: File | string | null;
  category_id?: number;
  is_adult?: boolean;
  is_draft?: boolean;
}

export interface UpdateBookRequestDto extends Partial<CreateBookRequestDto> {}

export interface BookFiltersDto {
  page?: number;
  per_page?: number;
  category_id?: number;
  is_published?: boolean;
  author_id?: number;
}

export interface CreateSectionRequestDto {
  title: string;
  order?: number;
  is_visible?: boolean;
}

export interface UpdateSectionRequestDto extends Partial<CreateSectionRequestDto> {}

export interface ReorderSectionsRequestDto {
  sections: { id: number; order: number }[];
}

export interface CreatePageRequestDto {
  content: string;
  order?: number;
}

export interface UpdatePageRequestDto extends Partial<CreatePageRequestDto> {}

