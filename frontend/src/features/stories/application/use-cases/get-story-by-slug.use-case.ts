/**
 * Use Case: Get Story By Slug
 * Application logic for fetching a single story by slug
 */
import { StoryRepository } from '../../domain/repositories/story.repository.interface';
import { StoryEntity } from '../../domain/entities/story.entity';

export class GetStoryBySlugUseCase {
  constructor(private readonly storyRepository: StoryRepository) {}

  async execute(slug: string): Promise<StoryEntity | null> {
    if (!slug || slug.trim().length === 0) {
      throw new Error('Slug cannot be empty');
    }

    return await this.storyRepository.findBySlug(slug);
  }
}

