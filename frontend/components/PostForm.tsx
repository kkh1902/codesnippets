'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import { PostCreate, Post } from '@/types/post';
import { Category } from '@/types/category';
import { categoriesApi, uploadsApi } from '@/lib/api';
import { Image as ImageIcon } from 'lucide-react';
import MarkdownPreview from './MarkdownPreview';

interface PostFormProps {
  initialData?: Post;
  onSubmit: (data: PostCreate) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function PostForm({ initialData, onSubmit, onCancel, isEdit = false }: PostFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<PostCreate>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    author: initialData?.author || '',
    category_id: initialData?.category_id || undefined,
    tags: initialData?.tags || '',
    language: initialData?.language || '',
    is_markdown: initialData?.is_markdown ?? true,
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const languages = ['python', 'javascript', 'typescript', 'sql', 'bash', 'jsx', 'tsx', 'json', 'markdown', 'java', 'go', 'rust'];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    setUploading(true);

    try {
      // 서버로 이미지 업로드
      const { url } = await uploadsApi.uploadImage(file);
      const imageMarkdown = `\n![image](${url})\n`;

      // 커서 위치에 이미지 마크다운 삽입
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent =
          formData.content.substring(0, start) +
          imageMarkdown +
          formData.content.substring(end);

        setFormData({ ...formData, content: newContent });

        // 커서 위치 조정
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length;
          textarea.focus();
        }, 0);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      // input 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    if (!items) return;

    // 이미지 찾기
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // 이미지 타입인지 확인
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault(); // 기본 붙여넣기 동작 방지

        const file = item.getAsFile();
        if (!file) continue;

        // 파일 크기 제한 (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('파일 크기는 5MB를 초과할 수 없습니다.');
          return;
        }

        setUploading(true);

        try {
          // 서버로 이미지 업로드
          const { url } = await uploadsApi.uploadImage(file);
          const imageMarkdown = `\n![image](${url})\n`;

          // 커서 위치에 이미지 마크다운 삽입
          const textarea = textareaRef.current;
          if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent =
              formData.content.substring(0, start) +
              imageMarkdown +
              formData.content.substring(end);

            setFormData({ ...formData, content: newContent });

            // 커서 위치 조정
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length;
              textarea.focus();
            }, 0);
          }
        } catch (error) {
          console.error('Image upload failed:', error);
          alert('이미지 업로드에 실패했습니다.');
        } finally {
          setUploading(false);
        }
        return; // 첫 번째 이미지 처리 후 종료
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">
          {isEdit ? '스니펫 수정' : '새 스니펫 작성'}
        </h2>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            제목 *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
            작성자 *
          </label>
          <input
            id="author"
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            카테고리
          </label>
          <select
            id="category"
            value={formData.category_id || ''}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">선택하지 않음</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            태그 (쉼표로 구분)
          </label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="react, hooks, performance"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Language */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
            신택스 하이라이팅 언어
          </label>
          <select
            id="language"
            value={formData.language || ''}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">선택하지 않음</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Content - 좌우 분할 */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              내용 * {formData.is_markdown && '(마크다운 지원)'}
            </label>
            <button
              type="button"
              onClick={handleImageButtonClick}
              disabled={uploading}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon className="w-4 h-4" />
              {uploading ? '업로드 중...' : '이미지 추가'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* 좌우 분할 레이아웃 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[600px]">
            {/* 왼쪽: 마크다운 입력 */}
            <div className="flex flex-col">
              <div className="text-xs text-gray-500 mb-1 font-medium">마크다운 입력</div>
              <textarea
                ref={textareaRef}
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                onPaste={handlePaste}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
                required
                placeholder="내용을 입력하세요. 이미지는 Ctrl+V로 붙여넣기 할 수 있습니다."
              />
            </div>

            {/* 오른쪽: 실시간 미리보기 */}
            <div className="flex flex-col overflow-hidden">
              <div className="text-xs text-gray-500 mb-1 font-medium">미리보기</div>
              <div className="flex-1 overflow-hidden">
                <MarkdownPreview content={formData.content} />
              </div>
            </div>
          </div>
        </div>

        {/* Markdown toggle */}
        <div className="flex items-center">
          <input
            id="is_markdown"
            type="checkbox"
            checked={formData.is_markdown}
            onChange={(e) => setFormData({ ...formData, is_markdown: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is_markdown" className="ml-2 block text-sm text-gray-700">
            마크다운으로 렌더링
          </label>
        </div>
      </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {isEdit ? '수정' : '작성'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
