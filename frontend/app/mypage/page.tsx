'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface UserInfo {
  id: number;
  username: string;
  email: string | null;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

interface Post {
  id: number;
  title: string;
  author: string;
  created_at: string;
  views: number;
  category_id?: number;
  language?: string;
}

export default function MyPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'posts'>('info');
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserInfo();
    fetchUserPosts();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUserInfo(response.data);
      setFormData({
        email: response.data.email || '',
        full_name: response.data.full_name || '',
        password: '',
        confirmPassword: ''
      });
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch user info:', error);
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        router.push('/auth/login');
      } else {
        alert('사용자 정보를 가져오는데 실패했습니다.');
      }
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/me/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setPosts(response.data);
      setPostsLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch posts:', error);
      setPostsLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      await axios.delete(`${API_BASE_URL}/api/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      alert('게시글이 삭제되었습니다.');
      // 게시글 목록 새로고침
      await fetchUserPosts();
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 비밀번호 확인
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      }

      // 업데이트할 데이터만 전송
      const updateData: any = {};
      if (formData.email !== userInfo?.email) {
        updateData.email = formData.email || null;
      }
      if (formData.full_name !== userInfo?.full_name) {
        updateData.full_name = formData.full_name || null;
      }
      if (formData.password) {
        updateData.password = formData.password;
      }

      await axios.put(
        `${API_BASE_URL}/api/auth/me`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('정보가 성공적으로 수정되었습니다.');
      setEditing(false);

      // 비밀번호 필드 초기화
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));

      // 사용자 정보 다시 가져오기
      await fetchUserInfo();

    } catch (error: any) {
      console.error('Failed to update user info:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('정보 수정에 실패했습니다.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">사용자 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
            <p className="text-blue-100">{userInfo.username}님의 계정 관리</p>
          </div>

          {/* 탭 네비게이션 */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                내 정보
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'posts'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                내 게시글 ({posts.length})
              </button>
            </div>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

            {/* 내 정보 탭 */}
            {activeTab === 'info' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">계정 정보</h2>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      정보 수정
                    </button>
                  )}
                </div>

                {!editing ? (
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        사용자명
                      </label>
                      <p className="text-lg text-gray-800">{userInfo.username}</p>
                    </div>

                    <div className="border-b pb-4">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        이메일
                      </label>
                      <p className="text-lg text-gray-800">
                        {userInfo.email || '(설정되지 않음)'}
                      </p>
                    </div>

                    <div className="border-b pb-4">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        이름
                      </label>
                      <p className="text-lg text-gray-800">
                        {userInfo.full_name || '(설정되지 않음)'}
                      </p>
                    </div>

                    <div className="border-b pb-4">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        계정 상태
                      </label>
                      <p className="text-lg text-gray-800">
                        {userInfo.is_active ? (
                          <span className="text-green-600">활성</span>
                        ) : (
                          <span className="text-red-600">비활성</span>
                        )}
                      </p>
                    </div>

                    <div className="border-b pb-4">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        가입일
                      </label>
                      <p className="text-lg text-gray-800">
                        {new Date(userInfo.created_at).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {userInfo.is_superuser && (
                      <div className="border-b pb-4">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          권한
                        </label>
                        <p className="text-lg text-gray-800">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            관리자
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        사용자명 (변경 불가)
                      </label>
                      <input
                        type="text"
                        value={userInfo.username}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이메일
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        이름
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="홍길동"
                      />
                    </div>

                    <div className="border-t pt-4 mt-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">비밀번호 변경</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        비밀번호를 변경하지 않으려면 아래 필드를 비워두세요.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            새 비밀번호
                          </label>
                          <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="새 비밀번호 (선택사항)"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            비밀번호 확인
                          </label>
                          <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="비밀번호 확인"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setError('');
                          setSuccess('');
                          setFormData({
                            email: userInfo?.email || '',
                            full_name: userInfo?.full_name || '',
                            password: '',
                            confirmPassword: ''
                          });
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* 내 게시글 탭 */}
            {activeTab === 'posts' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-6">내가 작성한 게시글</h2>

                {postsLoading ? (
                  <div className="text-center py-8 text-gray-600">로딩 중...</div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">작성한 게시글이 없습니다.</p>
                    <Link
                      href="/posts/new"
                      className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      새 게시글 작성
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              href={`/posts/${post.id}`}
                              className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                            >
                              {post.title}
                            </Link>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>
                                {new Date(post.created_at).toLocaleDateString('ko-KR')}
                              </span>
                              <span>조회수: {post.views}</span>
                              {post.language && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  {post.language}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Link
                              href={`/posts/${post.id}/edit`}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                            >
                              수정
                            </Link>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
