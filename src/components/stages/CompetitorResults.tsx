'use client';

import React, { useState } from 'react';
import { ArrowRight, Loader, Target, Award, CheckCircle } from 'lucide-react';
import { useBlog } from '@/components/BlogContext';
import { useAuth } from '@/components/AuthContext';
import { callGenerativeAPI } from '@/lib/gemini';

interface CompetitorResultsProps {
  result: any;
}

const CompetitorResults: React.FC<CompetitorResultsProps> = ({ result }) => {
  const { createNewPost, generateDraft } = useBlog();
  const { showToast } = useAuth();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleSelectAndGenerateDraft = async (title: string, outline: string) => {
    setIsGenerating(title);
    try {
      const newPostId = await createNewPost();
      if (!newPostId) throw new Error("포스트 생성에 실패했습니다.");

      showToast("AI 작가가 전략적 목차에 따라 초고를 작성합니다...", "info");
      
      const draftPrompt = `
<role>당신은 경쟁사의 글을 분석하여 그보다 뛰어난 글을 작성하는 최고의 블로그 작가입니다.</role>
<task>아래 <콘텐츠 지침>을 완벽히 준수하여, 경쟁사를 압도하는 고품질 블로그 포스트 초고를 한국어로 작성해주십시오.</task>
<strict_rules>
1.  **AI 정체성 숨기기**: 본문에 AI이거나, AI로서의 경력을 절대 언급하지 마십시오.
2.  **한국어 가독성 최적화**: 짧은 문장과 문단, 문장 리듬, 명시적 문맥 등 한국어 독자를 위한 글쓰기 원칙을 준수하십시오.
3.  **목차 완벽 준수**: 아래 제공된 [전략적 목차]의 구조와 내용을 반드시 충실하게 따르십시오.
</strict_rules>
<콘텐츠 지침>
- **주제**: ${title}
- **전략적 목차**: ${outline}
- **기본 구조**: '제목: ...' 형식으로 시작하며, 서론, 본론(소제목은 '##' 사용), 결론 순서로 작성하십시오.
</content_instructions>
---
[최종 초고 출력]:`;
      
      const fullText = await callGenerativeAPI(draftPrompt);
      const titleMatch = fullText.match(/^(제목|Title):\s*(.*)/im);
      const newTitle = titleMatch ? titleMatch[2] : title;
      const postContent = titleMatch ? fullText.substring(fullText.indexOf('\n') + 1).trim() : fullText;

      generateDraft(newPostId, { title: newTitle, draft: postContent, outline, mainKeyword: title });
      showToast("경쟁사를 뛰어넘는 초고 생성이 완료되었습니다!", "success");

    } catch (e: any) {
      showToast(`초고 생성 중 오류: ${e.message}`, "error");
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="mt-6 grid md:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-lg animate-fade-in">
      <div>
        <h4 className="font-semibold mb-3 text-red-600 flex items-center"><Target size={18} className="mr-2"/> AI의 공략 포인트 (콘텐츠 갭)</h4>
        <ul className="space-y-2 text-sm">
          {(result.content_gap || []).map((gap: string, i: number) => 
            <li key={i} className="flex items-start p-2 bg-red-50 rounded-md">
              <CheckCircle size={16} className="text-red-500 mr-2 mt-0.5 flex-shrink-0"/>
              <span>{gap}</span>
            </li>
          )}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-3 text-green-600 flex items-center"><Award size={18} className="mr-2"/> 추천 제목 선택 & 초고 생성</h4>
        <div className="space-y-2">
          {(result.titles || []).map((title: string) => (
            <button 
              key={title} 
              onClick={() => handleSelectAndGenerateDraft(title, result.new_outline)} 
              disabled={!!isGenerating}
              className="w-full text-left p-3 rounded-lg border bg-white hover:bg-green-50 text-sm transition-all flex items-center justify-between group disabled:opacity-50"
            >
              <span>{title}</span>
              {isGenerating === title ? 
                <Loader className="h-4 w-4 animate-spin flex-shrink-0 ml-2" /> : 
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-transform group-hover:translate-x-1" />
              }
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetitorResults;