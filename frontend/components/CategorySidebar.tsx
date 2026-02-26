'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { categoriesApi } from '@/lib/api';
import { CategoryTree } from '@/types/category';
import { ChevronRight, ChevronDown, FolderOpen, Folder } from 'lucide-react';

export default function CategorySidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [categories, setCategories] = useState<CategoryTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const selectedId = searchParams.get('category_id')
    ? Number(searchParams.get('category_id'))
    : null;

  useEffect(() => {
    categoriesApi.getCategoryTree()
      .then((data) => {
        setCategories(data);
        // 최상위 카테고리는 기본 펼침
        setExpanded(new Set(data.map((c) => c.id)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelect = (id: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === null || id === selectedId) {
      params.delete('category_id');
    } else {
      params.set('category_id', String(id));
    }
    // 메인 페이지로 이동
    router.push(`/?${params.toString()}`);
  };

  const renderTree = (items: CategoryTree[], depth = 0) =>
    items.map((cat) => {
      const hasChildren = cat.children && cat.children.length > 0;
      const isExpanded = expanded.has(cat.id);
      const isSelected = selectedId === cat.id;

      return (
        <div key={cat.id}>
          <button
            onClick={() => handleSelect(cat.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
              isSelected
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            style={{ paddingLeft: `${depth * 14 + 12}px` }}
          >
            {hasChildren ? (
              <span
                onClick={(e) => toggleExpand(cat.id, e)}
                className="shrink-0 text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </span>
            ) : (
              <span className="w-3.5 shrink-0" />
            )}
            {isSelected ? (
              <FolderOpen className="w-4 h-4 shrink-0 text-blue-600" />
            ) : (
              <Folder className="w-4 h-4 shrink-0 text-gray-400" />
            )}
            <span className="truncate">{cat.name}</span>
          </button>

          {hasChildren && isExpanded && (
            <div>{renderTree(cat.children, depth + 1)}</div>
          )}
        </div>
      );
    });

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="px-4 pt-6 pb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          카테고리
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {/* 전체 */}
        <button
          onClick={() => handleSelect(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
            selectedId === null
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <span className="w-3.5 shrink-0" />
          <Folder className="w-4 h-4 shrink-0 text-gray-400" />
          <span>전체</span>
        </button>

        {loading ? (
          <div className="px-3 py-4 text-xs text-gray-400">로딩 중...</div>
        ) : categories.length === 0 ? (
          <div className="px-3 py-4 text-xs text-gray-400">카테고리 없음</div>
        ) : (
          <div className="space-y-0.5">{renderTree(categories)}</div>
        )}
      </nav>

      {/* 관리 링크 */}
      <div className="px-4 py-3 border-t border-gray-100">
        <a
          href="/categories/manage"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          + 카테고리 관리
        </a>
      </div>
    </aside>
  );
}
