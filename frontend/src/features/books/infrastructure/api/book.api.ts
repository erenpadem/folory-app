/**
 * Infrastructure: Book API Client
 * HTTP client for book endpoints
 */
import api from '@/shared/lib/api-client';
import {
  BookListResponseDto,
  BookDetailResponseDto,
  CreateBookRequestDto,
  UpdateBookRequestDto,
  BookFiltersDto,
  CreateSectionRequestDto,
  UpdateSectionRequestDto,
  ReorderSectionsRequestDto,
  CreatePageRequestDto,
  UpdatePageRequestDto,
} from '../../application/dto/book.dto';

export class BookApi {
  async getBooks(filters?: BookFiltersDto): Promise<BookListResponseDto> {
    const params = {
      page: filters?.page || 1,
      per_page: filters?.per_page || 15,
      ...filters,
    };

    const response = await api.get<BookListResponseDto>('/api/books', { params });
    return response.data;
  }

  async getUserBooks(filters?: BookFiltersDto): Promise<BookListResponseDto> {
    const params = {
      page: filters?.page || 1,
      per_page: filters?.per_page || 15,
      ...filters,
    };

    const response = await api.get<BookListResponseDto>('/api/books/me', { params });
    return response.data;
  }

  async getBookById(id: number): Promise<BookDetailResponseDto> {
    const response = await api.get<BookDetailResponseDto>(`/api/books/${id}`);
    return response.data;
  }

  async createBook(data: CreateBookRequestDto): Promise<BookDetailResponseDto> {
    const response = await api.post<BookDetailResponseDto>('/api/books', data);
    return response.data;
  }

  async updateBook(id: number, data: UpdateBookRequestDto): Promise<BookDetailResponseDto> {
    const response = await api.put<BookDetailResponseDto>(`/api/books/${id}`, data);
    return response.data;
  }

  async deleteBook(id: number): Promise<void> {
    await api.delete(`/api/books/${id}`);
  }

  async publishBook(id: number): Promise<BookDetailResponseDto> {
    const response = await api.post<BookDetailResponseDto>(`/api/books/${id}/publish`);
    return response.data;
  }

  async getSimilarBooks(bookId: number): Promise<BookListResponseDto> {
    const response = await api.get<BookListResponseDto>(`/api/books/${bookId}/similar`);
    return response.data;
  }

  // Section APIs
  async getSections(bookId: number): Promise<{ data: any[] }> {
    const response = await api.get(`/api/books/${bookId}/sections`);
    return response.data;
  }

  async createSection(bookId: number, data: CreateSectionRequestDto): Promise<{ data: any }> {
    const response = await api.post(`/api/books/${bookId}/sections`, data);
    return response.data;
  }

  async updateSection(bookId: number, id: number, data: UpdateSectionRequestDto): Promise<{ data: any }> {
    const response = await api.put(`/api/books/${bookId}/sections/${id}`, data);
    return response.data;
  }

  async deleteSection(bookId: number, id: number): Promise<void> {
    await api.delete(`/api/books/${bookId}/sections/${id}`);
  }

  async reorderSections(bookId: number, data: ReorderSectionsRequestDto): Promise<void> {
    await api.post(`/api/books/${bookId}/sections/reorder`, data);
  }

  // Page APIs
  async getPages(sectionId: number): Promise<{ data: any[] }> {
    const response = await api.get(`/api/sections/${sectionId}/pages`);
    return response.data;
  }

  async createPage(sectionId: number, data: CreatePageRequestDto): Promise<{ data: any }> {
    const response = await api.post(`/api/sections/${sectionId}/pages`, data);
    return response.data;
  }

  async updatePage(sectionId: number, id: number, data: UpdatePageRequestDto): Promise<{ data: any }> {
    const response = await api.put(`/api/sections/${sectionId}/pages/${id}`, data);
    return response.data;
  }

  async deletePage(sectionId: number, id: number): Promise<void> {
    await api.delete(`/api/sections/${sectionId}/pages/${id}`);
  }
}

