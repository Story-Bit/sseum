'use client';

import { useBlog } from '@/components/BlogContext';
import { useAuth } from '@/components/AuthContext';
import { Button } from './ui/button';
import { Loader } from 'lucide-react';
import { useState } from 'react';

// GenerationType을 여기서 직접 정의하거나, gemini.ts에서 가져올 수 있습니다.
// 지금은 직접 정의하여 독립성을 높입니다.
type GenerationType = 'GENERATE_DRAFT' | 'REVISE_MYTHICAL' | 'SUGGEST_KEYWORDS';

const GenerateControls = () => {
  const { activePost, updateActivePost } = useBlog();
  const { showToast } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneration = async (type: GenerationType) => {
    if (!activePost) {
      showToast("먼저 포스트를 선택하거나 생성해야 합니다.", "error");
      return;
    }

    const textForApi = type === 'SUGGEST_KEYWORDS' ? activePost.title : activePost.draft;

    if (!textForApi) {
      showToast("요청에 필요한 제목 또는 내용이 없습니다.", "error");
      return;
    }

    setIsLoading(true);
    showToast("신탁을 받는 중...", "info");
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, text: textForApi }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '신탁을 받는 데 실패했습니다.');
      }
      
      if (type === 'SUGGEST_KEYWORDS') {
        const keywordArray = data.result.split(',').map((k: string) => k.trim());
        // 키워드를 저장하는 로직이 필요하다면 updateActivePost를 확장해야 합니다.
        // 지금은 임시로 draft에 추가하겠습니다.
        updateActivePost({ draft: `${activePost.draft}\n\n추천 키워드: ${data.result}` });
      } else {
        updateActivePost({ draft: data.result });
      }
      
      showToast('신탁을 성공적으로 받았습니다!', 'success');

    } catch (error: any) {
      console.error(error);
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);
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
      {isLoading && <Loader className="animate-spin text-blue-500" />}
    </div>
  );
};

export default GenerateControls;