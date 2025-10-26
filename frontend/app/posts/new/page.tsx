'use client';

import { useRouter } from 'next/navigation';
import PostForm from '@/components/PostForm';
import { postsApi } from '@/lib/api';
import { PostCreate } from '@/types/post';

export default function NewPostPage() {
  const router = useRouter();

  const handleSubmit = async (data: PostCreate) => {
    try {
      const newPost = await postsApi.createPost(data);
      alert('게시글이 작성되었습니다.');
      router.push(`/posts/${newPost.id}`);
    } catch (error) {
      alert('게시글 작성에 실패했습니다.');
      console.error(error);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PostForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
