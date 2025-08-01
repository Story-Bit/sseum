// 이 파일의 기존 내용을 모두 삭제하고 아래 코드로 교체하십시오.

'use client';

// 구시대의 BlogContext 대신, 새로운 심장 useBlogStore와 PostType을 가져옵니다.
import { useBlogStore, PostType } from '@/stores/blog-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PostList = () => {
  // useBlog() 대신 useBlogStore()에서 직접 필요한 상태와 함수를 가져옵니다.
  const { posts, activePost, setActivePost } = useBlogStore();

  const createNewPost = () => {
    setActivePost({
      id: `temp-${Date.now()}`,
      title: "새 포스트",
      draft: "<p>여기에 내용을 입력하세요.</p>",
    });
    toast.info("새 포스트가 생성되었습니다.");
  };

  const handleSelectPost = (post: PostType) => {
    setActivePost(post);
    toast.success(`'${post.title}' 글을 불러왔습니다.`);
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">포스트 목록</h2>
        <Button onClick={createNewPost} size="sm">새 글 작성</Button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {/* 'post'의 타입을 PostType으로 명확히 지정해줍니다. */}
        {posts.map((post: PostType) => (
          <button
            key={post.id}
            onClick={() => handleSelectPost(post)}
            className={cn(
              'block w-full rounded-md p-3 text-left transition-colors',
              activePost?.id === post.id
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <h3 className="font-semibold truncate">{post.title || '제목 없음'}</h3>
            <p className="truncate text-sm text-slate-500">
              {/* post.draft가 HTML 태그를 포함할 수 있으므로, 텍스트만 추출하는 것이 더 안전합니다. */}
              {post.draft ? `${post.draft.replace(/<[^>]*>?/gm, '').substring(0, 40)}...` : '내용 없음'}
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