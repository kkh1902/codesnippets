'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PostList from '@/components/PostList';
import Pagination from '@/components/Pagination';
import { postsApi } from '@/lib/api';
import { PostList as PostListType } from '@/types/post';
import Link from 'next/link';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryId = searchParams.get('category_id')
    ? Number(searchParams.get('category_id'))
    : null;

  const [postList, setPostList] = useState<PostListType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gridColumns, setGridColumns] = useState(3);

  // 카테고리 바뀌면 페이지 1로 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId]);

  useEffect(() => {
    setLoading(true);
    setError('');
    postsApi
      .getPosts(currentPage, 10, search || undefined, categoryId || undefined)
      .then(setPostList)
      .catch(() => setError('게시글을 불러오는데 실패했습니다.'))
      .finally(() => setLoading(false));
  }, [currentPage, search, categoryId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const totalPages = postList ? Math.ceil(postList.total / postList.page_size) : 1;

  return (
    <div className="flex-1 px-6 py-6">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="검색..."
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
            <button
              type="submit"
              className="px-4 py-1.5 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-800"
            >
              검색
            </button>
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); setSearchInput(''); }}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                초기화
              </button>
            )}
          </form>

          {/* 그리드 토글 */}
          <div className="flex items-center gap-1 ml-2">
            {[1, 2, 3, 4].map((cols) => (
              <button
                key={cols}
                onClick={() => setGridColumns(cols)}
                className={`w-7 h-7 text-xs rounded transition-colors ${
                  gridColumns === cols
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cols}
              </button>
            ))}
          </div>
        </div>

        <Link
          href="/posts/new"
          className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + 글쓰기
        </Link>
      </div>

      {/* 게시글 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      ) : postList ? (
        <>
          <PostList posts={postList.posts} gridColumns={gridColumns} />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
          <p className="mt-4 text-center text-xs text-gray-400">
            총 {postList.total}개
          </p>
        </>
      ) : null}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400">로딩 중...</div>}>
      <HomeContent />
    </Suspense>
  );
}
