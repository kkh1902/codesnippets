'use client';

import Link from 'next/link';
import { Post } from '@/types/post';

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
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

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        게시글이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              번호
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              제목
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              카테고리
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
              작성자
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              조회수
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
              작성일
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {post.id}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <Link
                  href={`/posts/${post.id}`}
                  className="hover:text-blue-600 hover:underline"
                >
                  {post.title}
                </Link>
                {post.tags && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {post.tags.split(',').slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs text-gray-500">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {post.category && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {post.category}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {post.author}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {post.views}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(post.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
