'use client';

import { useState, FormEvent } from 'react';
import { PostCreate, Post } from '@/types/post';

interface PostFormProps {
  initialData?: Post;
  onSubmit: (data: PostCreate) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function PostForm({ initialData, onSubmit, onCancel, isEdit = false }: PostFormProps) {
  const [formData, setFormData] = useState<PostCreate>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    author: initialData?.author || '',
    category: initialData?.category || '',
    tags: initialData?.tags || '',
    language: initialData?.language || '',
    is_markdown: initialData?.is_markdown ?? true,
  });

  const categories = ['Python', 'JavaScript', 'TypeScript', 'SQL', 'Docker', 'React', 'Node.js', 'FastAPI', 'Other'];
  const languages = ['python', 'javascript', 'typescript', 'sql', 'bash', 'jsx', 'tsx', 'json', 'markdown'];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEdit ? '게시글 수정' : '새 게시글 작성'}
      </h2>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            제목 *
          </label>
          <input
            type="text"
            id="title"
            required
            maxLength={200}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
            작성자 *
          </label>
          <input
            type="text"
            id="author"
            required
            maxLength={100}
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="작성자명을 입력하세요"
            disabled={isEdit}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            카테고리
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">선택 안함</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            태그 (쉼표로 구분)
          </label>
          <input
            type="text"
            id="tags"
            maxLength={200}
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: react, hooks, tutorial"
          />
        </div>

        {/* Language */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            코드 언어 (신택스 하이라이팅)
          </label>
          <select
            id="language"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">선택 안함</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Markdown Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_markdown"
            checked={formData.is_markdown}
            onChange={(e) => setFormData({ ...formData, is_markdown: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_markdown" className="ml-2 text-sm text-gray-700">
            마크다운 형식 사용
          </label>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            내용 * {formData.is_markdown && <span className="text-xs text-gray-500">(마크다운 지원)</span>}
          </label>
          <textarea
            id="content"
            required
            rows={15}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder={formData.is_markdown ? "# 제목\n\n코드 예시:\n```python\nprint('Hello World')\n```" : "내용을 입력하세요"}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {isEdit ? '수정' : '작성'}
        </button>
      </div>
    </form>
  );
}
