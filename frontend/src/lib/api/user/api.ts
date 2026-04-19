// lib/api/user.ts
import { User } from '@/types/auth';
import { Story } from '@/types/story';
import { Comment } from '@/types/comment';
import { authService } from '@/services/auth.service';

export const fetchUserProfile = async (userId: string): Promise<User> => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<User> => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update user profile');
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const fetchUserStories = async (userId: string): Promise<Story[]> => {
  try {
    const response = await fetch(`/api/users/${userId}/stories`);
    if (!response.ok) throw new Error('Failed to fetch user stories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user stories:', error);
    throw error;
  }
};

export const fetchUserComments = async (userId: string): Promise<Comment[]> => {
  try {
    const response = await fetch(`/api/users/${userId}/comments`);
    if (!response.ok) throw new Error('Failed to fetch user comments');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user comments:', error);
    throw error;
  }
};

export const fetchSavedStories = async (userId: string): Promise<Story[]> => {
  try {
    const response = await fetch(`/api/users/${userId}/saved`, {
      headers: {
        Authorization: `Bearer ${authService.getToken()}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch saved stories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching saved stories:', error);
    throw error;
  }
};