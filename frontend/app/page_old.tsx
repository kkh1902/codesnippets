'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostList from '@/components/PostList';
import Pagination from '@/components/Pagination';
import TagSidebar from '@/components/TagSidebar';
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
  const [gridColumns, setGridColumns] = useState(3); // 기본 3칸
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const fetchPosts = async (page: number, searchQuery: string, categoryId?: number | null, tag?: string | null) => {
    try {
      setLoading(true);
      setError('');
      const data = await postsApi.getPosts(page, 10, searchQuery || undefined, categoryId || undefined, tag || undefined);
      setPostList(data);
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage, search, selectedCategory, selectedTag);
  }, [currentPage, search, selectedCategory, selectedTag]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const totalPages = postList ? Math.ceil(postList.total / postList.page_size) : 1;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <TagSidebar
        selectedTag={selectedTag}
        selectedCategory={selectedCategory}
        onTagSelect={handleTagSelect}
        onCategorySelect={handleCategorySelect}
      />

      {/* Main Content */}
      <div className="flex-1 px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">게시판</h1>
            {selectedCategory && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                카테고리 #{selectedCategory}
              </span>
            )}
            {selectedTag && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                #{selectedTag}
              </span>
            )}
          </div>

          {/* Grid View Selector and New Post Button */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">보기:</span>
              {[1, 2, 3, 4].map((cols) => (
                <button
                  key={cols}
                  onClick={() => setGridColumns(cols)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    gridColumns === cols
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {cols}칸
                </button>
              ))}
            </div>

            <Link
              href="/posts/new"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              글쓰기
            </Link>
          </div>

          {/* Search */}
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
            <PostList posts={postList.posts} gridColumns={gridColumns} />
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
