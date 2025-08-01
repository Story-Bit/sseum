// 이 파일의 기존 내용을 모두 삭제하고 아래 코드로 교체하십시오.

'use client';

import { useBlogStore } from './stages/blog-store'; // 새로운 심장 useBlogStore
import { Button } from './ui/button';
import { Loader } from 'lucide-react';
import { toast } from 'sonner'; // 알림 기능은 sonner를 직접 사용합니다.

type GenerationType = 'GENERATE_DRAFT' | 'REVISE_MYTHICAL' | 'SUGGEST_KEYWORDS';

const GenerateControls = () => {
  // BlogContext와 AuthContext 대신, useBlogStore에서 모든 것을 가져옵니다.
  const { activePost, setActivePost, setLoading, isLoading, loadingMessage } = useBlogStore();

  const handleGeneration = async (type: GenerationType) => {
    if (!activePost) {
      toast.error("먼저 포스트를 선택하거나 생성해야 합니다.");
      return;
    }

    const textForApi = type === 'SUGGEST_KEYWORDS' ? activePost.title : activePost.draft;

    if (!textForApi) {
      toast.error("요청에 필요한 제목 또는 내용이 없습니다.");
      return;
    }

    setLoading(true, "신탁을 받는 중입니다...");
    
    try {
      // API 호출 로직은 그대로 유지합니다.
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, text: textForApi }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '신탁을 받는 데 실패했습니다.');
      }
      
      let updatedPost;
      if (type === 'SUGGEST_KEYWORDS') {
        const keywordArray = data.result.split(',').map((k: string) => k.trim());
        updatedPost = { 
          ...activePost, 
          strategyResult: { ...activePost.strategyResult, keywords: keywordArray }
        };
      } else {
        updatedPost = { ...activePost, draft: data.result };
      }
      
      setActivePost(updatedPost); // setActivePost로 상태를 업데이트합니다.
      toast.success('신탁을 성공적으로 받았습니다!');

    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border-t">
      <Button onClick={() => handleGeneration('GENERATE_DRAFT')} disabled={!activePost || isLoading}>
        초안 생성
      </Button>
      <Button onClick={() => handleGeneration('REVISE_MYTHICAL')} disabled={!activePost || isLoading}>
        신화급 퇴고
      </Button>
      <Button onClick={() => handleGeneration('SUGGEST_KEYWORDS')} disabled={!activePost || isLoading}>
        키워드 추천
      </Button>
      {/* isLoading 상태를 useBlogStore에서 직접 가져옵니다. */}
      {isLoading && <Loader className="animate-spin text-blue-500" />}
    </div>
  );
};

export default GenerateControls;