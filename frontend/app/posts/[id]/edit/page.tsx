'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PostForm from '@/components/PostForm';
import { postsApi } from '@/lib/api';
import { Post, PostCreate } from '@/types/post';

export default function EditPostPage() {
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

  const handleSubmit = async (data: PostCreate) => {
    if (!post) return;

    try {
      await postsApi.updatePost(post.id, {
        title: data.title,
        content: data.content,
      });
      alert('게시글이 수정되었습니다.');
      router.push(`/posts/${post.id}`);
    } catch (error) {
      alert('게시글 수정에 실패했습니다.');
      console.error(error);
    }
  };

  const handleCancel = () => {
    if (post) {
      router.push(`/posts/${post.id}`);
    } else {
      router.push('/');
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
          <PostForm
            initialData={post}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEdit={true}
          />
        ) : null}
      </div>
    </div>
  );
}
