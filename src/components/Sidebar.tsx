// 이 파일의 기존 내용을 모두 삭제하고 아래 코드로 교체하십시오.

'use client';

import { useBlogStore, PostType } from '@/stores/blog-store'; // PostType을 함께 불러옵니다.
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// 이제 이 컴포넌트는 어떠한 props도 받지 않습니다.
export default function Sidebar() {
  const { posts, activePost, setActivePost } = useBlogStore();

  const handleNewPost = () => {
    setActivePost({
      id: `temp-${Date.now()}`,
      title: "새 포스트",
      draft: "<p>여기에 내용을 입력하세요.</p>",
    });
    toast.info("새 포스트 초안이 생성되었습니다.");
  };

  // 'post' 매개변수가 'PostType'임을 명확히 알려줍니다.
  const handleSelectPost = (post: PostType) => {
    setActivePost(post);
    toast.success(`'${post.title}' 글을 불러왔습니다.`);
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-950 border-r">
      <div className="p-4 border-b">
        <Button className="w-full" onClick={handleNewPost}>
          새 글 작성
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <h2 className="text-lg font-semibold mb-2">저장된 글</h2>
        <div className="space-y-2">
          {posts.length > 0 ? (
            // 'post' 매개변수가 'PostType'임을 명확히 알려줍니다.
            posts.map((post: PostType) => (
              <div
                key={post.id}
                onClick={() => handleSelectPost(post)}
                className={`p-2 rounded-md cursor-pointer border ${
                  activePost?.id === post.id
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <p className="font-medium truncate">{post.title}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">저장된 글이 없습니다.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}