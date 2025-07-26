'use client';

import { useBlog } from '@/components/BlogContext';
import { Input } from '@/components/ui/input';

const MainKeywordInput = () => {
  // 새로운 useBlog 훅에서 필요한 데이터와 함수를 가져옵니다.
  const { activePost, updateActivePost } = useBlog();

  if (!activePost) {
    // 활성화된 포스트가 없으면 아무것도 보여주지 않습니다.
    return null;
  }

  return (
    <Input
      value={activePost.mainKeyword || ''}
      // updateActivePost 함수를 사용하여 핵심 키워드(mainKeyword)를 업데이트합니다.
      onChange={(e) => updateActivePost({ mainKeyword: e.target.value })}
      placeholder="핵심 키워드를 입력하세요..."
      className="border-gray-300"
    />
  );
};

export default MainKeywordInput;