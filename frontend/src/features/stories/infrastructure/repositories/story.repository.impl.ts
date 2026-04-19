/**
 * Infrastructure: Story Repository Implementation
 * Concrete implementation of story repository using API
 */
import {
  StoryRepository,
  StoryFilters,
  PaginatedResponse,
} from '../../domain/repositories/story.repository.interface';
import { StoryEntity } from '../../domain/entities/story.entity';
import { StoryApi } from '../api/story.api';

export class StoryRepositoryImpl implements StoryRepository {
  constructor(private readonly storyApi: StoryApi) {}

  async findAll(filters?: StoryFilters): Promise<PaginatedResponse<StoryEntity>> {
    const response = await this.storyApi.getStories(filters);
    return {
      data: response.data.map((story) => StoryEntity.fromPrimitives(story)),
      meta: response.meta,
    };
  }

  async findById(id: string): Promise<StoryEntity | null> {
    try {
      const response = await this.storyApi.getStoryById(id);
      return StoryEntity.fromPrimitives(response.data);
    } catch (error) {
      return null;
    }
  }

  async findBySlug(slug: string): Promise<StoryEntity | null> {
    try {
      const response = await this.storyApi.getStoryBySlug(slug);
      return StoryEntity.fromPrimitives(response.data);
    } catch (error) {
      return null;
    }
  }

  async findByUserId(userId: string, filters?: StoryFilters): Promise<PaginatedResponse<StoryEntity>> {
    const response = await this.storyApi.getUserStories(filters);
    return {
      data: response.data.map((story) => StoryEntity.fromPrimitives(story)),
      meta: response.meta,
    };
  }

  async create(story: Partial<StoryEntity>): Promise<StoryEntity> {
    const formData = new FormData();
    formData.append('title', story.title || '');
    formData.append('description', story.description || '');
    if (story.shortDescription) formData.append('short_description', story.shortDescription);
    if (story.categoryId) formData.append('category_id', story.categoryId);
    if (story.genreIds) {
      story.genreIds.forEach((id) => formData.append('genre_ids[]', id));
    }
    if (story.tags) {
      story.tags.forEach((tag) => formData.append('tags[]', tag));
    }
    if (story.status) formData.append('status', story.status);
    formData.append('is_adult', String(story.isAdult || false));
    if (story.contentRating) formData.append('content_rating', story.contentRating);

    const response = await this.storyApi.createStory(formData);
    return StoryEntity.fromPrimitives(response.data);
  }

  async update(id: string, story: Partial<StoryEntity>): Promise<StoryEntity> {
    const formData = new FormData();
    if (story.title) formData.append('title', story.title);
    if (story.description) formData.append('description', story.description);
    if (story.shortDescription !== undefined) {
      formData.append('short_description', story.shortDescription || '');
    }
    if (story.categoryId !== undefined) formData.append('category_id', story.categoryId || '');
    if (story.genreIds) {
      story.genreIds.forEach((id) => formData.append('genre_ids[]', id));
    }
    if (story.tags) {
      story.tags.forEach((tag) => formData.append('tags[]', tag));
    }
    if (story.status) formData.append('status', story.status);
    if (story.isAdult !== undefined) formData.append('is_adult', String(story.isAdult));
    if (story.contentRating) formData.append('content_rating', story.contentRating);
    if (story.publishedAt) {
      formData.append('published_at', story.publishedAt.toISOString());
    }

    const response = await this.storyApi.updateStory(id, formData);
    return StoryEntity.fromPrimitives(response.data);
  }

  async delete(id: string): Promise<void> {
    await this.storyApi.deleteStory(id);
  }

  async findSimilar(storyId: string, filters?: StoryFilters): Promise<PaginatedResponse<StoryEntity>> {
    const response = await this.storyApi.getSimilarStories(storyId, filters);
    return {
      data: response.data.map((story) => StoryEntity.fromPrimitives(story)),
      meta: response.meta,
    };
  }

  async addSimilar(storyId: string, similarStoryId: string): Promise<void> {
    await this.storyApi.addSimilarStory(storyId, similarStoryId);
  }

  async removeSimilar(storyId: string, similarStoryId: string): Promise<void> {
    await this.storyApi.removeSimilarStory(storyId, similarStoryId);
  }
}

