// src/types/story.ts

export type StoryStatus = 'draft' | 'published' | 'archived' | 'pending_review';
export type ContentRating = 'general' | 'teen' | 'mature' | 'explicit';

export interface UserStub {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  followers_count?: number;
  is_verified?: boolean;
  username?: string;
}

export interface CategoryStub {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface GenreStub {
  id: string;
  name: string;
  slug: string;
}

export interface CommentAuthor {
  id: string;
  name: string;
  avatar?: string;
  username?: string;
  is_verified?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  likes_count: number;
  replies_count: number;
  is_edited: boolean;
  is_deleted: boolean;
  user_id: string;
  story_id?: string | null;
  chapter_id?: string | null;
  parent_id?: string | null;
  
  // Relations (included from API)
  user?: CommentAuthor;
  replies?: Comment[];
  
  // UI states
  is_liked?: boolean;
  is_expanded?: boolean;
  is_replying?: boolean;
  is_editing?: boolean;
}

export interface CommentFormData {
  content: string;
  story_id?: string;
  chapter_id?: string;
  parent_id?: string | null;
}

export interface Chapter {
  id: string;
  story_id: string;
  title: string;
  slug: string;
  content: string;
  position: number;
  word_count: number;
  status: StoryStatus;
  view_count?: number;
  likes_count?: number;
  comments_count?: number;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  deleted_at?: string | null;
  
  // Computed fields for frontend
  reading_time?: number;
  is_new?: boolean;
  is_updated?: boolean;
  comments?: Comment[];
}

export interface ChapterFormData {
  title: string;
  content: string;
  position?: number;
  status?: StoryStatus;
}

export interface ChapterCard {
  id: string;
  title: string;
  slug: string;
  position: number;
  word_count: number;
  status: StoryStatus;
  created_at: string;
  reading_time?: number;
}

export interface Story {
  id: string;
  user_id: string;
  slug: string;
  
  // Content
  title: string;
  description: string;
  short_description?: string;
  cover_image?: string | null;
  word_count: number;
  reading_time?: number;
  
  // Status & moderation
  status: StoryStatus;
  is_featured: boolean;
  is_adult: boolean;
  content_rating: ContentRating;
  is_approved: boolean;
  
  // Statistics
  view_count: number;
  unique_views: number;
  rating: number;
  likes_count: number;
  comments_count: number;
  bookmarks_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  deleted_at?: string | null;
  
  // Relations
  category_id?: string | null;
  genre_ids?: string[];
  
  // Included relations
  user?: UserStub;
  category?: CategoryStub | null;
  genres?: GenreStub[];
  chapters?: Chapter[];
  tags?: string[];
  comments?: Comment[];
  
  // Computed fields
  cover_url?: string;
  author_name?: string;
  genres_list?: string;
  first_published_at?: string;
  
  // UI flags
  is_new?: boolean;
  is_updated?: boolean;
}

// In your @/types/story file
export interface StoryFormData {
  id: string;
  title: string;
  description: string;
  short_description: string;
  cover_image: string | null;
  category_id: string;
  genre_ids: string[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  is_adult: boolean;
  content_rating: 'general' | 'teen' | 'mature';
  comments_count: number;
}

export interface StoryCard {
  id: string;
  title: string;
  slug: string;
  cover_url?: string;
  author_name: string;
  short_description?: string;
  word_count: number;
  likes_count: number;
  comments_count: number;
  status: StoryStatus;
  created_at: string;
  updated_at: string;
  genres_list?: string;
  reading_time?: number;
}

export interface StoryCommentStats {
  total_comments: number;
  total_replies: number;
  top_commenters: {
    user_id: string;
    name: string;
    avatar?: string;
    comment_count: number;
  }[];
}