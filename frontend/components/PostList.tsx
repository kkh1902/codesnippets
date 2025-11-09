'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@/types/post';
import { Grid, LayoutGrid, Rows, Columns } from 'lucide-react';

interface PostListProps {
  posts: Post[];
  gridColumns?: number;
}

type LayoutType = 1 | 2 | 3 | 4;

export default function PostList({ posts, gridColumns }: PostListProps) {
  const [layout, setLayout] = useState<LayoutType>((gridColumns as LayoutType) || 3);

  // Sync with parent gridColumns prop
  useEffect(() => {
    if (gridColumns) {
      setLayout(gridColumns as LayoutType);
    }
  }, [gridColumns]);

  // Load layout preference from localStorage
  useEffect(() => {
    if (!gridColumns) {
      const savedLayout = localStorage.getItem('postListLayout');
      if (savedLayout) {
        setLayout(parseInt(savedLayout) as LayoutType);
      }
    }
  }, [gridColumns]);

  // Save layout preference
  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayout(newLayout);
    localStorage.setItem('postListLayout', newLayout.toString());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getGridClass = () => {
    switch (layout) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        게시글이 없습니다.
      </div>
    );
  }

  return (
    <div>
      {/* Post Grid */}
      <div className={`grid ${getGridClass()} gap-6`}>
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="group"
          >
            <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 h-full flex flex-col overflow-hidden">
              {/* Card Header */}
              <div className="p-4 flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-2">
                  {post.title}
                </h3>

                {/* Content Preview */}
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {post.content.substring(0, 150)}...
                </p>

                {/* Tags */}
                {post.tags && (
                  <div className="flex gap-1 flex-wrap mb-3">
                    {post.tags.split(',').slice(0, 4).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  {post.category && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                      {post.category.name}
                    </span>
                  )}
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>👁 {post.views}</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
