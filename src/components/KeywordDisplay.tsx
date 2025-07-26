'use client';

import { useBlog } from '@/components/BlogContext';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { BlogData } from '@/components/BlogContext'; // BlogData 타입을 가져옵니다.

const KeywordDisplay = () => {
  // [수정] 새로운 useBlog 훅에서 필요한 데이터와 함수를 가져옵니다.
  const { activePost, setActivePost, setPosts } = useBlog();

  if (!activePost) {
    return null;
  }

  // BlogData에 keywords와 mainKeywords가 있다고 가정합니다.
  // 이 타입들은 BlogContext.tsx의 BlogData 인터페이스에 추가되어야 합니다.
  const keywords = (activePost as any).keywords || [];
  const mainKeywords = (activePost as any).mainKeywords || [];

  const handleRemoveKeyword = (keywordToRemove: string) => {
    if (!activePost) return;
    const updatedKeywords = keywords.filter((k: string) => k !== keywordToRemove);
    
    const updatedPost = { ...activePost, keywords: updatedKeywords };
    setActivePost(updatedPost as BlogData);
    
    // posts 배열도 함께 업데이트하여 동기화를 유지합니다.
    setPosts(prev => prev.map(p => p.id === activePost.id ? (updatedPost as BlogData) : p));
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-700">핵심 키워드</h3>
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
        <h3 className="text-sm font-semibold mb-2 text-gray-700">추천 키워드</h3>
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