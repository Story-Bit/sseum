'use client';

import { useBlog } from '@/components/BlogContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PostList = () => {
  // 새로운 Context에서 필요한 함수와 데이터를 가져옵니다.
  const { posts, activePost, setActivePostById, createNewPost } = useBlog();

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">포스트 목록</h2>
        <Button onClick={createNewPost} size="sm">새 글 작성</Button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => setActivePostById(post.id)}
            className={cn(
              'block w-full rounded-md p-3 text-left transition-colors',
              activePost?.id === post.id
                ? 'bg-blue-100 text-blue-800'
                : 'hover:bg-slate-100'
            )}
          >
            <h3 className="font-semibold">{post.title || '제목 없음'}</h3>
            <p className="truncate text-sm text-slate-500">
              {post.draft ? `${post.draft.substring(0, 40)}...` : '내용 없음'}
            </p>
          </button>
        ))}
        {posts.length === 0 && (
          <div className="pt-10 text-center text-slate-500">
            <p>작성된 포스트가 없습니다.</p>
            <p className="text-sm">'새 글 작성'을 눌러 시작하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;