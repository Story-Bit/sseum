// 이 파일의 기존 내용을 모두 삭제하고 아래의 완벽한 코드로 교체하십시오.

'use client';

import { useBlogStore } from '@/stores/blog-store';
import { Input } from '@/components/ui/input';

const MainKeywordInput = () => {
  const { activePost, setActivePost } = useBlogStore();

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // activePost가 null일 가능성은 아래 return 문에서 이미 방지되지만,
    // 만약을 위해 방어 코드를 유지합니다.
    if (!activePost) return;
    
    setActivePost({ 
      ...activePost, 
      strategyResult: {
        ...(activePost.strategyResult || {}), 
        mainKeyword: e.target.value
      } 
    });
  };

  // activePost가 존재할 때만 Input 컴포넌트를 렌더링하고,
  // 그렇지 않으면 아무것도 렌더링하지 않습니다(null).
  // 이것이 가장 안전하고 현대적인 React의 방식입니다.
  return activePost ? (
    <Input
      value={activePost.strategyResult?.mainKeyword || ''}
      onChange={handleKeywordChange}
      placeholder="핵심 키워드를 입력하세요..."
      className="border-gray-300"
    />
  ) : null;
};

export default MainKeywordInput;