/**
 * Use Case: Get Stories
 * Application logic for fetching stories list
 */
import { StoryRepository, StoryFilters } from '../../domain/repositories/story.repository.interface';
import { StoryEntity } from '../../domain/entities/story.entity';
import { PaginatedResponse } from '../../domain/repositories/story.repository.interface';

export class GetStoriesUseCase {
  constructor(private readonly storyRepository: StoryRepository) {}

  async execute(filters?: StoryFilters): Promise<PaginatedResponse<StoryEntity>> {
    return await this.storyRepository.findAll(filters);
  }
}

