'use client';

import { useBlog } from '@/components/BlogContext';
import { Input } from '@/components/ui/input';

const TitleInput = () => {
  // 새로운 useBlog 훅에서 필요한 데이터와 함수를 가져옵니다.
  const { activePost, updateActivePost } = useBlog();

  if (!activePost) {
    // 활성화된 포스트가 없으면 제목 입력란을 보여주지 않습니다.
    return (
        <span className="text-lg font-semibold text-muted-foreground">
            포스트를 선택하세요
        </span>
    );
  }

  return (
    <Input
      value={activePost.title}
      // updateActivePost 함수를 사용하여 제목(title)을 업데이트합니다.
      onChange={(e) => updateActivePost({ title: e.target.value })}
      placeholder="포스트 제목을 입력하세요..."
      className="border-none bg-transparent text-lg font-bold shadow-none focus-visible:ring-0"
    />
  );
};

export default TitleInput;