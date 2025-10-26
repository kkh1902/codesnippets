'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PostDetail from '@/components/PostDetail';
import { postsApi } from '@/lib/api';
import { Post } from '@/types/post';

export default function PostPage() {
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError('');
        const id = Number(params.id);
        const data = await postsApi.getPost(id);
        setPost(data);
      } catch (err) {
        setError('게시글을 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!post || !confirm('정말 삭제하시겠습니까?')) return;

    try {
      await postsApi.deletePost(post.id);
      alert('게시글이 삭제되었습니다.');
      router.push('/');
    } catch (error) {
      alert('게시글 삭제에 실패했습니다.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : post ? (
          <PostDetail post={post} onDelete={handleDelete} />
        ) : null}
      </div>
    </div>
  );
}
