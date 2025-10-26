export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  category?: string | null;
  tags?: string | null;
  language?: string | null;
  is_markdown: boolean;
  views: number;
  created_at: string;
  updated_at: string | null;
}

export interface PostCreate {
  title: string;
  content: string;
  author: string;
  category?: string;
  tags?: string;
  language?: string;
  is_markdown?: boolean;
}

export interface PostUpdate {
  title?: string;
  content?: string;
  author?: string;
  category?: string;
  tags?: string;
  language?: string;
  is_markdown?: boolean;
}

export interface PostList {
  total: number;
  page: number;
  page_size: number;
  posts: Post[];
}
