'use client';

import { Post } from '@/types/post';
import Link from 'next/link';
import MarkdownPreview from './MarkdownPreview';

interface PostDetailProps {
  post: Post;
  onDelete?: () => void;
}

export default function PostDetail({ post, onDelete }: PostDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
        <div className="flex items-center flex-wrap gap-2 mb-3">
          {post.category && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {post.category.name}
            </span>
          )}
          {post.language && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {post.language}
            </span>
          )}
          {post.tags && post.tags.split(',').map((tag, idx) => (
            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              #{tag.trim()}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>작성자: {post.author}</span>
            <span>조회수: {post.views}</span>
          </div>
          <div>
            {formatDate(post.created_at)}
            {post.updated_at && (
              <span className="ml-2 text-gray-400">
                (수정됨: {formatDate(post.updated_at)})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {post.is_markdown ? (
          <MarkdownPreview content={post.content} />
        ) : (
          <div className="prose max-w-none whitespace-pre-wrap">
            {post.content}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t px-6 py-4 flex justify-between">
        <Link
          href="/"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          목록으로
        </Link>
        <div className="space-x-2">
          <Link
            href={`/posts/${post.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            수정
          </Link>
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
