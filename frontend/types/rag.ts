export interface RAGSearchRequest {
  query: string;
  top_k?: number;
  category_id?: number | null;
  language?: string | null;
}

export interface RAGSource {
  post_id: number;
  title: string;
  relevance_score: number;
  excerpt: string;
}

export interface RAGSearchResponse {
  answer: string;
  sources: RAGSource[];
  tokens_used: number;
  model: string;
}
