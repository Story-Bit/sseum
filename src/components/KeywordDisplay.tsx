// 이 파일의 기존 내용을 모두 삭제하고 아래 코드로 교체하십시오.

'use client';

// 구시대의 BlogContext 대신, 새로운 심장 useBlogStore와 PostType을 가져옵니다.
import { useBlogStore, PostType } from '@/stores/blog-store';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const KeywordDisplay = () => {
  // useBlog() 대신 useBlogStore()에서 직접 필요한 상태와 함수를 가져옵니다.
  const { activePost, setActivePost, upsertPostInList } = useBlogStore();

  if (!activePost) {
    return null;
  }

  // activePost.strategyResult에 키워드들이 저장되어 있다고 가정합니다.
  const keywords = activePost.strategyResult?.keywords || [];
  const mainKeywords = activePost.strategyResult?.mainKeywords || [];

  const handleRemoveKeyword = (keywordToRemove: string) => {
    if (!activePost) return;

    // 추천 키워드 목록에서 선택된 키워드를 제거합니다.
    const updatedKeywords = keywords.filter((k: string) => k !== keywordToRemove);
    
    // activePost 상태를 새로운 키워드 목록으로 업데이트합니다.
    const updatedPost = { 
      ...activePost, 
      strategyResult: {
        ...activePost.strategyResult,
        keywords: updatedKeywords,
      }
    };

    // setActivePost와 upsertPostInList를 함께 사용하여
    // 현재 작업 상태와 저장된 글 목록의 상태를 모두 동기화합니다.
    setActivePost(updatedPost as PostType);
    upsertPostInList(updatedPost as PostType);
    toast.info(`'${keywordToRemove}' 키워드가 제거되었습니다.`);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">핵심 키워드</h3>
        <div className="flex flex-wrap gap-2">
          {mainKeywords.map((keyword: string) => (
            <Badge key={keyword} variant="default">
              {keyword}
            </Badge>
          ))}
          {mainKeywords.length === 0 && <p className="text-xs text-gray-500">아직 핵심 키워드가 없습니다.</p>}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">추천 키워드</h3>
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword: string) => (
            <Badge key={keyword} variant="secondary" className="group">
              {keyword}
              <button
                onClick={() => handleRemoveKeyword(keyword)}
                className="ml-1.5 opacity-50 group-hover:opacity-100 transition-opacity"
                title={`${keyword} 제거`}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          {keywords.length === 0 && <p className="text-xs text-gray-500">추천 키워드가 없습니다.</p>}
        </div>
      </div>
    </div>
  );
};

export default KeywordDisplay;