/**
 * Data Transfer Objects (DTOs)
 * Used for data transfer between layers
 */
import { StoryEntity } from '../../domain/entities/story.entity';
import { ChapterEntity } from '../../domain/entities/chapter.entity';
import { PaginatedResponse } from '../../domain/repositories/story.repository.interface';

export interface StoryListResponseDto extends PaginatedResponse<StoryEntity> {}
export interface StoryDetailResponseDto {
  data: StoryEntity;
}

export interface CreateStoryRequestDto {
  title: string;
  description: string;
  short_description?: string;
  cover_image?: File | string | null;
  category_id?: string;
  genre_ids?: string[];
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  is_adult?: boolean;
  content_rating?: 'general' | 'teen' | 'mature' | 'explicit';
}

export interface UpdateStoryRequestDto extends Partial<CreateStoryRequestDto> {}

export interface StoryFiltersDto {
  page?: number;
  per_page?: number;
  search?: string;
  genre?: string;
  status?: 'draft' | 'published' | 'archived';
  min_chapters?: number;
  max_chapters?: number;
  min_likes?: number;
  max_likes?: number;
  recently_updated?: boolean;
  sort_by?: 'popular' | 'new' | 'top-rated' | 'created_at' | 'updated_at' | 'title';
  sort_dir?: 'asc' | 'desc';
}

export interface ChapterDto extends ChapterEntity {}
export interface CreateChapterRequestDto {
  story_id: string;
  title: string;
  content: string;
  position?: number;
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateChapterRequestDto extends Partial<CreateChapterRequestDto> {}

