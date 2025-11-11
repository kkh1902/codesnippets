'use client';

import { useState, useEffect } from 'react';
import { ragApi, postsApi, categoriesApi } from '@/lib/api';
import { Sparkles, Loader2, Edit3, Save, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { useRouter } from 'next/navigation';
import { Category } from '@/types/category';

export default function AIWriter() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  // AI 생성 결과
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedLanguage, setGeneratedLanguage] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState('');

  // 편집 모드
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedCategory, setEditedCategory] = useState('');

  // 카테고리 목록 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    setError('');

    try {
      const response = await ragApi.generate({
        prompt: prompt.trim()
      });

      setGeneratedTitle(response.title);
      setGeneratedContent(response.content);
      setGeneratedLanguage(response.language);

      // AI가 카테고리 추천
      const category = suggestCategory(response.language, response.content);
      setSuggestedCategory(category);

      setEditedTitle(response.title);
      setEditedContent(response.content);
      setEditedCategory(category);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'AI 생성 중 오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const suggestCategory = (language: string, content: string): string => {
    const lowerContent = content.toLowerCase();

    // 언어별 기본 카테고리
    if (language === 'python') {
      if (lowerContent.includes('fastapi') || lowerContent.includes('flask') || lowerContent.includes('django')) {
        return 'python';
      }
      if (lowerContent.includes('pandas') || lowerContent.includes('numpy')) {
        return 'python';
      }
      return 'python';
    } else if (language === 'javascript' || language === 'typescript') {
      if (lowerContent.includes('react') || lowerContent.includes('usestate') || lowerContent.includes('useeffect')) {
        return 'react';
      }
      if (lowerContent.includes('node') || lowerContent.includes('express')) {
        return 'javascript';
      }
      return 'javascript';
    }

    return language || 'general';
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Saving post:', {
        title: isEditing ? editedTitle : generatedTitle,
        content: isEditing ? editedContent : generatedContent,
        author: 'Admin',
        category: suggestedCategory,
        language: generatedLanguage,
        tags: `ai-generated,${generatedLanguage}`,
        is_markdown: true
      });

      const response = await postsApi.createPost({
        title: isEditing ? editedTitle : generatedTitle,
        content: isEditing ? editedContent : generatedContent,
        author: 'Admin',
        category: editedCategory || suggestedCategory,
        language: generatedLanguage,
        tags: `ai-generated,${generatedLanguage}`,
        is_markdown: true
      });

      console.log('Save response:', response);
      alert('게시글이 저장되었습니다!');
      router.push(`/posts/${response.id}`);
    } catch (err: any) {
      console.error('Save error:', err);
      const errorMsg = err.response?.data?.detail
        || err.message
        || JSON.stringify(err.response?.data)
        || '게시글 저장 중 오류가 발생했습니다.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedTitle('');
    setGeneratedContent('');
    setGeneratedLanguage('');
    setSuggestedCategory('');
    setEditedCategory('');
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* AI 프롬프트 입력 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Edit3 className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">AI 코드 작성</h2>
        </div>

        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: Python으로 파일을 읽고 JSON으로 파싱하는 코드를 작성해줘"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleGenerate();
              }
            }}
          />

          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI가 코드를 작성하고 있습니다...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                AI로 코드 생성 (Ctrl+Enter)
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

      {/* 생성된 결과 */}
      {generatedContent && (
        <div className="space-y-6">
          {/* 미리보기 / 편집 모드 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  {isEditing ? '편집 모드' : '미리보기'}
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditing ? '미리보기' : '편집'}
                </button>
                <button
                  onClick={handleRegenerate}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  다시 생성
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  게시글로 저장
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리
                  </label>
                  <select
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">카테고리 선택</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    내용
                  </label>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                    rows={20}
                  />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {generatedTitle}
                </h1>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {generatedContent}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* 메타 정보 */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex gap-4 text-sm text-gray-600">
                <span>
                  <strong>언어:</strong> {generatedLanguage}
                </span>
                <span>
                  <strong>카테고리:</strong> {editedCategory || suggestedCategory}
                  {editedCategory && editedCategory !== suggestedCategory && (
                    <span className="text-blue-600"> (수정됨)</span>
                  )}
                </span>
                <span>
                  <strong>태그:</strong> ai-generated, {generatedLanguage}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
