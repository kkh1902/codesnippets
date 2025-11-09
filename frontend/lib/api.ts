import axios from 'axios';
import { Post, PostCreate, PostUpdate, PostList } from '@/types/post';
import { Category, CategoryTree, CategoryCreate, CategoryUpdate } from '@/types/category';
import { Tag, TagTree, TagCreate, TagUpdate } from '@/types/tag';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const postsApi = {
  // 게시글 목록 조회
  getPosts: async (page: number = 1, pageSize: number = 10, search?: string, categoryId?: number, tag?: string): Promise<PostList> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    if (categoryId) {
      params.append('category_id', categoryId.toString());
    }

    if (tag) {
      params.append('tag', tag);
    }

    const response = await api.get<PostList>(`/api/posts?${params.toString()}`);
    return response.data;
  },

  // 모든 태그 조회
  getAllTags: async (): Promise<Array<{ tag: string; count: number }>> => {
    const response = await api.get('/api/posts/tags/all');
    return response.data;
  },

  // 단일 게시글 조회
  getPost: async (id: number): Promise<Post> => {
    const response = await api.get<Post>(`/api/posts/${id}`);
    return response.data;
  },

  // 게시글 생성
  createPost: async (post: PostCreate): Promise<Post> => {
    const response = await api.post<Post>('/api/posts', post);
    return response.data;
  },

  // 게시글 수정
  updatePost: async (id: number, post: PostUpdate): Promise<Post> => {
    const response = await api.put<Post>(`/api/posts/${id}`, post);
    return response.data;
  },

  // 게시글 삭제
  deletePost: async (id: number): Promise<void> => {
    await api.delete(`/api/posts/${id}`);
  },
};

export const categoriesApi = {
  // 카테고리 트리 조회
  getCategoryTree: async (): Promise<CategoryTree[]> => {
    const response = await api.get<CategoryTree[]>('/api/categories/tree');
    return response.data;
  },

  // 전체 카테고리 조회 (평면)
  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/api/categories');
    return response.data;
  },

  // 특정 카테고리 조회
  getCategory: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/api/categories/${id}`);
    return response.data;
  },

  // 카테고리 생성
  createCategory: async (category: CategoryCreate): Promise<Category> => {
    const response = await api.post<Category>('/api/categories', category);
    return response.data;
  },

  // 카테고리 수정
  updateCategory: async (id: number, category: CategoryUpdate): Promise<Category> => {
    const response = await api.put<Category>(`/api/categories/${id}`, category);
    return response.data;
  },

  // 카테고리 삭제
  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/api/categories/${id}`);
  },
};

export const tagsApi = {
  // 태그 트리 조회
  getTagTree: async (): Promise<TagTree[]> => {
    const response = await api.get<TagTree[]>('/api/tags/tree');
    return response.data;
  },

  // 전체 태그 조회 (평면)
  getAllTags: async (): Promise<Tag[]> => {
    const response = await api.get<Tag[]>('/api/tags');
    return response.data;
  },

  // 특정 태그 조회
  getTag: async (id: number): Promise<Tag> => {
    const response = await api.get<Tag>(`/api/tags/${id}`);
    return response.data;
  },

  // 태그 생성
  createTag: async (tag: TagCreate): Promise<Tag> => {
    const response = await api.post<Tag>('/api/tags', tag);
    return response.data;
  },

  // 태그 수정
  updateTag: async (id: number, tag: TagUpdate): Promise<Tag> => {
    const response = await api.put<Tag>(`/api/tags/${id}`, tag);
    return response.data;
  },

  // 태그 삭제
  deleteTag: async (id: number): Promise<void> => {
    await api.delete(`/api/tags/${id}`);
  },
};

export const uploadsApi = {
  // 이미지 업로드
  uploadImage: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/api/uploads`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;

import { RAGSearchRequest, RAGSearchResponse } from '@/types/rag';

export const ragApi = {
  // RAG 기반 검색
  search: async (request: RAGSearchRequest): Promise<RAGSearchResponse> => {
    const response = await api.post<RAGSearchResponse>('/api/rag/search', request);
    return response.data;
  },

  // RAG 시스템 상태 확인
  healthCheck: async () => {
    const response = await api.get('/api/rag/health');
    return response.data;
  }
};
