import axios from 'axios';
import { Post, PostCreate, PostUpdate, PostList } from '@/types/post';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const postsApi = {
  // 게시글 목록 조회
  getPosts: async (page: number = 1, pageSize: number = 10, search?: string): Promise<PostList> => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const response = await api.get<PostList>(`/api/posts?${params.toString()}`);
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

export default api;
