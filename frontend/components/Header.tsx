'use client';

import Link from 'next/link';

interface UserInfo {
  username: string;
  is_superuser: boolean;
}

interface HeaderProps {
  onMenuClick?: () => void;
  username?: string | null;
  userInfo?: UserInfo | null;
  onLogout?: () => void;
}

export default function Header({ onMenuClick, username, userInfo, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">학습 노트</h2>

        <div className="flex items-center gap-2">
          {/* 로그인 상태 표시 */}
          {username ? (
            <>
              <div className="flex items-center gap-2">
                {/* 관리자 배지 */}
                {userInfo?.is_superuser && (
                  <span className="px-3 py-1 text-xs font-bold bg-red-600 text-white rounded-md cursor-default">
                    관리자
                  </span>
                )}
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">{username}</span> 님
                </span>
              </div>
              <Link
                href="/mypage"
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                마이페이지
              </Link>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}

          {/* 관리자 전용 메뉴 */}
          {userInfo?.is_superuser && (
            <>
              <Link
                href="/categories/manage"
                className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
              >
                ⚙️ 카테고리 관리
              </Link>
              <Link
                href="/tags/manage"
                className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
              >
                🏷️ 태그 관리
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
