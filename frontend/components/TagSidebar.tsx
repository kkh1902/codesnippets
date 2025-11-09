'use client';

import { useState, useEffect, useCallback } from 'react';
import { tagsApi, categoriesApi } from '@/lib/api';
import { TagTree } from '@/types/tag';
import { CategoryTree } from '@/types/category';
import { Tag, ChevronRight, ChevronDown, FolderTree, X, Menu } from 'lucide-react';

interface TagSidebarProps {
  selectedTag: string | null;
  selectedCategory: number | null;
  onTagSelect: (tag: string | null) => void;
  onCategorySelect: (categoryId: number | null) => void;
}

export default function TagSidebar({ selectedTag, selectedCategory, onTagSelect, onCategorySelect }: TagSidebarProps) {
  const [tagTree, setTagTree] = useState<TagTree[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTags, setExpandedTags] = useState<Set<number>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [isOpen, setIsOpen] = useState(true);
  const [isCategorySectionOpen, setIsCategorySectionOpen] = useState(true); // 카테고리 섹션은 기본 열림
  const [isTagSectionOpen, setIsTagSectionOpen] = useState(true); // 태그 섹션은 기본 열림

  const getAllTagIds = useCallback((tags: TagTree[]): number[] => {
    let ids: number[] = [];
    tags.forEach(tag => {
      ids.push(tag.id);
      if (tag.children && tag.children.length > 0) {
        ids = ids.concat(getAllTagIds(tag.children));
      }
    });
    return ids;
  }, []);

  const getAllCategoryIds = useCallback((categories: CategoryTree[]): number[] => {
    let ids: number[] = [];
    categories.forEach(cat => {
      ids.push(cat.id);
      if (cat.children && cat.children.length > 0) {
        ids = ids.concat(getAllCategoryIds(cat.children));
      }
    });
    return ids;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tags, categories] = await Promise.all([
          tagsApi.getTagTree(),
          categoriesApi.getCategoryTree()
        ]);
        setTagTree(tags);
        setCategoryTree(categories);

        // 태그는 모두 펼침, 카테고리는 모두 닫힌 상태
        setExpandedTags(new Set(getAllTagIds(tags)));
        setExpandedCategories(new Set()); // 카테고리는 모두 닫힘
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAllTagIds, getAllCategoryIds]);

  const toggleTagExpand = (tagId: number) => {
    const newExpanded = new Set(expandedTags);
    if (newExpanded.has(tagId)) {
      newExpanded.delete(tagId);
    } else {
      newExpanded.add(tagId);
    }
    setExpandedTags(newExpanded);
  };

  const toggleCategoryExpand = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryTree = (categories: CategoryTree[], level = 0) => {
    return categories.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);
      const isSelected = selectedCategory === category.id;

      return (
        <div key={category.id}>
          <button
            onClick={() => onCategorySelect(category.id === selectedCategory ? null : category.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
              isSelected
                ? 'bg-green-100 text-green-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategoryExpand(category.id);
                }}
                className="p-0.5"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}

            <span className="truncate flex-1">{category.name}</span>
          </button>

          {hasChildren && isExpanded && (
            <div>
              {renderCategoryTree(category.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const renderTagTree = (tags: TagTree[], level = 0) => {
    return tags.map((tag) => {
      const hasChildren = tag.children && tag.children.length > 0;
      const isExpanded = expandedTags.has(tag.id);
      const isSelected = selectedTag === tag.slug;

      return (
        <div key={tag.id}>
          <button
            onClick={() => onTagSelect(tag.slug === selectedTag ? null : tag.slug)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
              isSelected
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTagExpand(tag.id);
                }}
                className="p-0.5"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}

            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: tag.color || '#3B82F6' }}
            />

            <span className="truncate flex-1">{tag.name}</span>
          </button>

          {hasChildren && isExpanded && (
            <div>
              {renderTagTree(tag.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-0 top-20 z-50 bg-white border border-gray-300 rounded-r-lg p-2 shadow-lg hover:bg-gray-50"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Sidebar */}
      <div className={`${isOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 overflow-hidden transition-all duration-300 relative`}>
        <div className="p-6 overflow-y-auto h-full">
          {/* Categories Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setIsCategorySectionOpen(!isCategorySectionOpen)}
                className="text-lg font-semibold text-gray-900 flex items-center gap-2 hover:text-gray-700"
              >
                {isCategorySectionOpen ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                <FolderTree className="w-5 h-5" />
                카테고리
              </button>
              <div className="flex items-center gap-2">
                {selectedCategory && (
                  <button
                    onClick={() => onCategorySelect(null)}
                    className="text-xs text-green-600 hover:text-green-800"
                  >
                    초기화
                  </button>
                )}
                {/* Close Button - 카테고리 오른쪽 */}
                {isOpen && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="사이드바 닫기"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {isCategorySectionOpen && (
              <>
                {loading ? (
                  <div className="text-sm text-gray-500">로딩 중...</div>
                ) : categoryTree.length === 0 ? (
                  <div className="text-sm text-gray-500">카테고리가 없습니다.</div>
                ) : (
                  <div className="space-y-1">
                    {renderCategoryTree(categoryTree)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tags Section */}
          <div className="mb-6 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setIsTagSectionOpen(!isTagSectionOpen)}
                className="text-lg font-semibold text-gray-900 flex items-center gap-2 hover:text-gray-700"
              >
                {isTagSectionOpen ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
                <Tag className="w-5 h-5" />
                태그
              </button>
              {selectedTag && (
                <button
                  onClick={() => onTagSelect(null)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  초기화
                </button>
              )}
            </div>

            {isTagSectionOpen && (
              <>
                {loading ? (
                  <div className="text-sm text-gray-500">로딩 중...</div>
                ) : tagTree.length === 0 ? (
                  <div className="text-sm text-gray-500">태그가 없습니다.</div>
                ) : (
                  <div className="space-y-1">
                    {renderTagTree(tagTree)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
