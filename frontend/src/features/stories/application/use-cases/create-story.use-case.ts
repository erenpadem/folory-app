/**
 * Use Case: Create Story
 * Application logic for creating a new story
 */
import { StoryRepository } from '../../domain/repositories/story.repository.interface';
import { StoryEntity } from '../../domain/entities/story.entity';
import { CreateStoryRequestDto } from '../dto/story.dto';

export class CreateStoryUseCase {
  constructor(private readonly storyRepository: StoryRepository) {}

  async execute(request: CreateStoryRequestDto): Promise<StoryEntity> {
    if (!request.title || request.title.trim().length === 0) {
      throw new Error('Story title is required');
    }

    if (!request.description || request.description.trim().length === 0) {
      throw new Error('Story description is required');
    }

    const storyData = {
      title: request.title,
      description: request.description,
      shortDescription: request.short_description || null,
      status: (request.status || 'draft') as StoryEntity['status'],
      isAdult: request.is_adult || false,
      contentRating: (request.content_rating || 'general') as StoryEntity['contentRating'],
      categoryId: request.category_id || null,
      genreIds: request.genre_ids || [],
      tags: request.tags || [],
    };

    return await this.storyRepository.create(storyData);
  }
}

