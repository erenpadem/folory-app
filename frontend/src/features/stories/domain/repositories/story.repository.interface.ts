/**
 * Repository Interface (Port)
 * Defines the contract for story persistence operations
 */
import { StoryEntity } from '../entities/story.entity';
import { ChapterEntity } from '../entities/chapter.entity';

export interface StoryFilters {
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

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from?: number;
    to?: number;
  };
}

export interface StoryRepository {
  findAll(filters?: StoryFilters): Promise<PaginatedResponse<StoryEntity>>;
  findById(id: string): Promise<StoryEntity | null>;
  findBySlug(slug: string): Promise<StoryEntity | null>;
  findByUserId(userId: string, filters?: StoryFilters): Promise<PaginatedResponse<StoryEntity>>;
  create(story: Partial<StoryEntity>): Promise<StoryEntity>;
  update(id: string, story: Partial<StoryEntity>): Promise<StoryEntity>;
  delete(id: string): Promise<void>;
  findSimilar(storyId: string, filters?: StoryFilters): Promise<PaginatedResponse<StoryEntity>>;
  addSimilar(storyId: string, similarStoryId: string): Promise<void>;
  removeSimilar(storyId: string, similarStoryId: string): Promise<void>;
}

export interface ChapterRepository {
  findByStoryId(storyId: string): Promise<ChapterEntity[]>;
  findById(id: string): Promise<ChapterEntity | null>;
  create(chapter: Partial<ChapterEntity>): Promise<ChapterEntity>;
  update(id: string, chapter: Partial<ChapterEntity>): Promise<ChapterEntity>;
  delete(id: string): Promise<void>;
  reorder(storyId: string, chapterIds: string[]): Promise<void>;
}

