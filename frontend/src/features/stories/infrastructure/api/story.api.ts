/**
 * Infrastructure: Story API Client
 * HTTP client for story endpoints
 */
import api from '@/shared/lib/api-client';
import {
  StoryListResponseDto,
  StoryDetailResponseDto,
  CreateStoryRequestDto,
  UpdateStoryRequestDto,
  StoryFiltersDto,
} from '../../application/dto/story.dto';

export class StoryApi {
  async getStories(filters?: StoryFiltersDto): Promise<StoryListResponseDto> {
    const params = {
      page: filters?.page || 1,
      per_page: filters?.per_page || 15,
      ...filters,
    };

    const response = await api.get<StoryListResponseDto>('/stories', { params });
    return response.data;
  }

  async getUserStories(filters?: StoryFiltersDto): Promise<StoryListResponseDto> {
    const params = {
      page: filters?.page || 1,
      per_page: filters?.per_page || 15,
      ...filters,
    };

    const response = await api.get<StoryListResponseDto>('/stories/me/stories', { params });
    return response.data;
  }

  async getStoryById(id: string): Promise<StoryDetailResponseDto> {
    const response = await api.get<StoryDetailResponseDto>(`/stories/${id}`);
    return response.data;
  }

  async getStoryBySlug(slug: string): Promise<StoryDetailResponseDto> {
    const response = await api.get<StoryDetailResponseDto>(`/stories/${slug}`);
    return response.data;
  }

  async createStory(data: FormData): Promise<StoryDetailResponseDto> {
    const response = await api.post<StoryDetailResponseDto>('/stories', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateStory(id: string, data: FormData): Promise<StoryDetailResponseDto> {
    const response = await api.put<StoryDetailResponseDto>(`/stories/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteStory(id: string): Promise<void> {
    await api.delete(`/stories/${id}`);
  }

  async getSimilarStories(storyId: string, filters?: StoryFiltersDto): Promise<StoryListResponseDto> {
    const params = {
      page: filters?.page || 1,
      per_page: filters?.per_page || 5,
      ...filters,
    };

    const response = await api.get<StoryListResponseDto>(`/stories/${storyId}/similar`, { params });
    return response.data;
  }

  async addSimilarStory(storyId: string, similarStoryId: string): Promise<void> {
    await api.post(`/stories/${storyId}/similar/${similarStoryId}`);
  }

  async removeSimilarStory(storyId: string, similarStoryId: string): Promise<void> {
    await api.delete(`/stories/${storyId}/similar/${similarStoryId}`);
  }
}

