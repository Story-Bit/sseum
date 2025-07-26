'use client';

import { useBlog } from '@/components/BlogContext';
import { Textarea } from '@/components/ui/textarea';

const Editor = () => {
  // [수정] 새로운 useBlog 훅에서 필요한 데이터와 함수를 가져옵니다.
  const { activePost, updateActivePost } = useBlog();

  if (!activePost) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-slate-50 p-4 text-center">
        <p className="text-slate-500">왼쪽 목록에서 포스트를 선택하거나 '새 글 작성'을 눌러 시작하세요.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex-1 p-4">
      <Textarea
        placeholder="이곳에서 당신의 생각이 제련된다..."
        value={activePost.draft}
        // [수정] updateActivePost 함수를 사용하여 내용(draft)을 업데이트합니다.
        onChange={(e) => updateActivePost({ draft: e.target.value })}
        className="h-full w-full resize-none border-0 p-0 text-base focus-visible:ring-0 bg-transparent"
      />
    </div>
  );
};

export default Editor;