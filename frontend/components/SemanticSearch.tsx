'use client';

import { useState } from 'react';
import { ragApi } from '@/lib/api';
import { RAGSearchResponse } from '@/types/rag';
import { Sparkles, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';

export default function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RAGSearchResponse | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await ragApi.search({
        query: query.trim(),
        top_k: 5
      });
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'AI 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* 검색 입력 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">AI 코드 검색</h2>
        </div>

        <div className="space-y-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="예: 파이썬에서 비동기 처리하는 방법을 알려줘"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleSearch();
              }
            }}
          />

          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI가 답변을 생성하고 있습니다...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                AI 검색 (Ctrl+Enter)
              </>
            )}
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* 검색 결과 */}
      {result && (
        <div className="space-y-6">
          {/* AI 답변 */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">AI 답변</h3>
              <span className="ml-auto text-sm text-gray-500">
                {result.model} · {result.tokens_used} tokens
              </span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {result.answer}
            </div>
          </div>

          {/* 참조 문서 */}
          {result.sources.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  참조한 코드 스니펫 ({result.sources.length})
                </h3>
              </div>

              <div className="space-y-3">
                {result.sources.map((source, index) => (
                  <Link
                    key={source.post_id}
                    href={`/posts/${source.post_id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 hover:text-purple-600">
                        {index + 1}. {source.title}
                      </h4>
                      <span className="text-sm font-medium text-purple-600 ml-2">
                        {Math.round(source.relevance_score * 100)}% 일치
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {source.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
