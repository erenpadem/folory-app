/**
 * Use Case: Publish Story
 * Application logic for publishing a story
 */
import { StoryRepository } from '../../domain/repositories/story.repository.interface';
import { StoryEntity } from '../../domain/entities/story.entity';

export class PublishStoryUseCase {
  constructor(private readonly storyRepository: StoryRepository) {}

  async execute(storyId: string): Promise<StoryEntity> {
    const story = await this.storyRepository.findById(storyId);

    if (!story) {
      throw new Error('Story not found');
    }

    if (!story.canBePublished) {
      throw new Error('Story cannot be published. Missing required fields or chapters.');
    }

    return await this.storyRepository.update(storyId, {
      status: 'published',
      publishedAt: new Date(),
    });
  }
}

