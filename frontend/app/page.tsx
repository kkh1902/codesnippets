'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostList from '@/components/PostList';
import Pagination from '@/components/Pagination';
import { postsApi } from '@/lib/api';
import { PostList as PostListType } from '@/types/post';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [postList, setPostList] = useState<PostListType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async (page: number, searchQuery: string) => {
    try {
      setLoading(true);
      setError('');
      const data = await postsApi.getPosts(page, 10, searchQuery || undefined);
      setPostList(data);
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage, search);
  }, [currentPage, search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const totalPages = postList ? Math.ceil(postList.total / postList.page_size) : 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">게시판</h1>

          {/* Search and New Post */}
          <div className="flex justify-between items-center">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                검색
              </button>
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSearchInput('');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  초기화
                </button>
              )}
            </form>

            <Link
              href="/posts/new"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              글쓰기
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : postList ? (
          <>
            <PostList posts={postList.posts} />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
            <div className="mt-4 text-center text-sm text-gray-600">
              총 {postList.total}개의 게시글
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
