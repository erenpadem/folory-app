// src/lib/api/story.ts
import api from '../../api';
import { Story } from '@/types/story';

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

export const fetchStories = async (filters: StoryFilters = {}): Promise<PaginatedResponse<Story>> => {
  const params = {
    page: filters.page || 1,
    per_page: filters.per_page || 15,
    ...filters
  };

  try {
    const response = await api.get('/stories', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
};

export const fetchUserStories = async (filters: StoryFilters = {}): Promise<PaginatedResponse<Story>> => {
  const params = {
    page: filters.page || 1,
    per_page: filters.per_page || 15,
    ...filters
  };

  try {
    const response = await api.get('/stories/me/stories', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user stories:', error);
    throw error;
  }
};

export const fetchStoryById = async (id: string): Promise<Story> => {
  try {
    const response = await api.get(`/stories/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching story:', error);
    throw error;
  }
};

export const createStory = async (storyData: FormData): Promise<Story> => {
  try {
    const response = await api.post('/stories', storyData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating story:', error);
    throw error;
  }
};

export const updateStory = async (id: string, storyData: FormData): Promise<Story> => {
  try {
    const response = await api.put(`/stories/${id}`, storyData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating story:', error);
    throw error;
  }
};

export const deleteStory = async (id: string): Promise<void> => {
  try {
    await api.delete(`/stories/${id}`);
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
};

export const fetchSimilarStories = async (storyId: string, filters: StoryFilters = {}): Promise<PaginatedResponse<Story>> => {
  const params = {
    page: filters.page || 1,
    per_page: filters.per_page || 5,
    ...filters
  };

  try {
    const response = await api.get(`/stories/${storyId}/similar`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching similar stories:', error);
    throw error;
  }
};

export const addSimilarStory = async (storyId: string, similarStoryId: string): Promise<void> => {
  try {
    await api.post(`/stories/${storyId}/similar/${similarStoryId}`);
  } catch (error) {
    console.error('Error adding similar story:', error);
    throw error;
  }
};

export const removeSimilarStory = async (storyId: string, similarStoryId: string): Promise<void> => {
  try {
    await api.delete(`/stories/${storyId}/similar/${similarStoryId}`);
  } catch (error) {
    console.error('Error removing similar story:', error);
    throw error;
  }
};