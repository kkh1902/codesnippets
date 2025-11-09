'use client';

import Link from 'next/link';
import { Home, FolderTree, Tags } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-4 fixed h-screen">
      <Link
        href="/"
        className={`p-3 rounded-lg transition-colors ${
          isActive('/')
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="홈"
      >
        <Home className="w-6 h-6" />
      </Link>

      <Link
        href="/categories/manage"
        className={`p-3 rounded-lg transition-colors ${
          isActive('/categories/manage')
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="카테고리 관리"
      >
        <FolderTree className="w-6 h-6" />
      </Link>

      <Link
        href="/tags/manage"
        className={`p-3 rounded-lg transition-colors ${
          isActive('/tags/manage')
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="태그 관리"
      >
        <Tags className="w-6 h-6" />
      </Link>
    </div>
  );
}
