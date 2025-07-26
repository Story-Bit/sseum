'use client';

import React, { useState } from 'react';
import { ArrowRight, Loader, Rocket, Layers, Users, Lightbulb, BrainCircuit } from 'lucide-react';
import { useBlog } from '@/components/BlogContext';
import { useAuth } from '@/components/AuthContext';
import { callGenerativeAPI } from '@/lib/gemini';
import StarRating from '@/components/ui/StarRating';

const BLOG_TYPE_GUIDELINES: Record<string, any> = {
    '일상/취미': { length: '1,000~1,500자', role: '친한 친구처럼 수다를 떠는 스토리텔러', style: '개인적인 경험과 감정을 솔직하게 담아 독자와 깊은 공감대를 형성합니다...' },
    '정보성 콘텐츠': { length: '1,500~2,500자', role: '핵심만 명확하게 알려주는 친절한 전문가', style: '정확하고 검증된 정보를 명확하고 구조적으로 전달하는 것이 중요합니다...' },
    '제품 리뷰/심층 가이드': { length: '2,000~3,000자', role: '장단점까지 꼼꼼하게 비교 분석하는 테크 리뷰어', style: '제품의 스펙, 장단점, 사용법, 구매 팁 등 깊이 있는 정보를 제공합니다...' },
    '전문가 분석/보고서': { length: '3,000자 이상', role: '데이터를 기반으로 미래를 예측하는 데이터 분석가', style: '특정 분야에 대한 전문적인 지식과 통찰력을 보여줍니다...' }
};

interface NewIdeaResultsProps {
  result: any;
  blogType: string | null;
}

const NewIdeaResults: React.FC<NewIdeaResultsProps> = ({ result, blogType }) => {
  const { createNewPost, generateDraft, setGeneratingDraft, setCurrentStage } = useBlog();
  const { showToast } = useAuth();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleSelectAndGenerateDraft = async (title: string) => {
    setIsGenerating(title);
    setGeneratingDraft(true);
    try {
      const newPostId = await createNewPost();
      if (!newPostId) throw new Error("포스트 생성에 실패했습니다.");
      
      showToast("AI 기획자가 글의 목차를 구성하고 있습니다...", "info");
      const selectedBlogType = blogType || '정보성 콘텐츠';
      const typeGuideline = BLOG_TYPE_GUIDELINES[selectedBlogType];
      
      const outlinePrompt = `<role>당신은 네이버 블로그 전문 콘텐츠 기획자입니다.</role><task>다음 주제와 블로그 유형에 맞춰, 서론-본론-결론 구조를 갖춘 상세한 목차를 생성해주세요. 본론에는 최소 3~5개 이상의 소제목이 포함되어야 합니다.</task>\n\n주제: "${title}"\n블로그 유형: ${selectedBlogType} (${typeGuideline.length})`;
      const schema = { type: "OBJECT", properties: { outline: { type: "STRING" } }, required: ["outline"] };
      const outlineResult = await callGenerativeAPI(outlinePrompt, schema);
      const outline = outlineResult.outline;
      if (!outline) throw new Error("AI가 목차를 생성하지 못했습니다.");

      showToast("구성된 목차에 따라 AI 작가가 초고를 작성합니다...", "info");
      const finalStyleGuide = localStorage.getItem('userStyleGuide') || `- 서두: 독자의 공감을 유도하는 질문이나 문제 제기로 시작한다.\n- 문체: 친근하고 설득력 있는 말투를 사용하며, "저", "여러분" 같은 표현을 자연스럽게 쓴다. AI 느낌이 나지 않도록 사람이 직접 쓴 것처럼 작성한다.\n- 구조: 짧은 문단과 줄 바꿈을 활용하여 가독성을 높인다.`;
      if(localStorage.getItem('userStyleGuide')) showToast("저장된 나만의 스타일을 초고에 반영합니다.", "info");

      const draftPrompt = `<role>당신은 '${selectedBlogType}' 유형의 글을 쓰는 '${typeGuideline.role}'입니다.</role><task>아래의 모든 지시사항을 엄격히 준수하여, 독자가 끝까지 읽을 수밖에 없는 고품질 블로그 포스트 초고를 한국어로 작성해주십시오.</task><strict_rules>1. **목표 분량 절대 준수**: 최종 결과물은 반드시 **'${typeGuideline.length}'** 범위에 맞춰야 합니다. 2. **AI 정체성 숨기기**: 본문에 AI이거나, AI로서의 경력을 절대 언급하지 마십시오. 3. **가독성 최우선**: 모든 문장은 1~2줄을 넘지 않도록 짧게 작성하고, 2~3문장마다 문단을 나누어 모바일 가독성을 극대화하십시오. 4. **목차 완벽 준수**: 아래 제공된 [목차]의 구조와 내용을 반드시 충실하게 따르십시오.</strict_rules><content_instructions>- **주제**: ${title}\n- **목차**: ${outline}</content_instructions><style_instructions>- **핵심 스타일 가이드**: ${typeGuideline.style}\n- **작성자 개인 스타일 가이드**: ${finalStyleGuide}\n- **기본 구조**: '제목: ...' 형식으로 시작하며, 서론, 본론(소제목은 '##' 사용), 결론 순서로 작성하십시오.</style_instructions>---[최종 초고 출력]:`;
        
      const fullText = await callGenerativeAPI(draftPrompt);
      const titleMatch = fullText.match(/^(제목|Title):\s*(.*)/im);
      const newTitle = titleMatch ? titleMatch[2] : title;
      const postContent = titleMatch ? fullText.substring(fullText.indexOf('\n') + 1).trim() : fullText;

      generateDraft(newPostId, { title: newTitle, draft: postContent, outline, mainKeyword: title });
      showToast("고품질 초고 생성이 완료되었습니다!", "success");

    } catch (e: any) {
        showToast(`초고 생성 중 오류: ${e.message}`, "error");
        setCurrentStage('strategy');
    } finally {
        setIsGenerating(null);
        setGeneratingDraft(false);
    }
  };

  if (!result) return null;

  return (
    <div className="mt-8 animate-fade-in space-y-12">
      <h2 className="text-3xl font-bold text-center">AI 키워드 전략 분석 결과</h2>
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center"><Rocket className="w-6 h-6 mr-3 text-red-500"/>키워드 기회 점수 (KOS)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(result.kos_scores || []).map((item: any) => (
            <div key={item.keyword} className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start mb-2"><p className="font-bold text-gray-800">{item.keyword}</p><StarRating score={Math.round(item.score)} /></div>
              <div className="text-xs text-gray-500 space-y-1"><p>월간 검색량: {item.search_volume}</p><p>콘텐츠 포화도: {item.content_saturation}</p><p>광고 경쟁: {item.ad_competition}</p></div>
            </div>
          ))}
        </div>
      </section>
      {result.pillar_content && (
        <section>
            <h3 className="text-xl font-bold mb-4 flex items-center"><Lightbulb className="w-6 h-6 mr-3 text-green-500"/>AI 추천 필러 콘텐츠 전략</h3>
            <div className="p-6 text-center bg-green-50 rounded-2xl border-2 border-green-200 border-dashed">
                <h4 className="text-xl font-bold text-green-800">{result.pillar_content.title}</h4>
                <p className="text-sm text-green-700 mt-2 mb-4">{result.pillar_content.description}</p>
                <button onClick={() => handleSelectAndGenerateDraft(result.pillar_content.title)} disabled={!!isGenerating} className="bg-green-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-700 transition-colors text-sm">
                  {isGenerating === result.pillar_content.title ? <Loader className="animate-spin" /> : '이 전략으로 초고 생성'}
                </button>
            </div>
        </section>
      )}
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center"><Layers className="w-6 h-6 mr-3 text-blue-500"/>주제별 키워드 클러스터</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(result.clusters || []).map((cluster: any) => (
            <div key={cluster.name} className="bg-white p-4 rounded-lg border shadow-sm">
              <p className="font-bold mb-3 text-blue-800">{cluster.name}</p>
              <div className="flex flex-wrap gap-2">{(cluster.keywords || []).map((kw: string) => <span key={kw} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{kw}</span>)}</div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-xl font-bold mb-4 flex items-center"><Users className="w-6 h-6 mr-3 text-purple-500"/>타겟 독자 및 추천 글감</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {(result.personas || []).map((p: any) => (
            <div key={p.name} className="bg-white p-5 rounded-lg border shadow-sm h-full flex flex-col">
              <div>
                <p className="font-bold text-lg text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-500 mt-1 mb-4 italic">"{p.pain_point}"</p>
                <div className="flex items-start text-xs text-blue-800 bg-blue-50 p-3 rounded-md mb-4">
                     <BrainCircuit size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                     <p><span className="font-bold">AI 공략 비급:</span> {p.writing_tactic}</p>
                 </div>
              </div>
              <div className="space-y-2 mt-auto border-t pt-4">
                <p className="text-xs font-bold text-gray-500 mb-2">추천 글감 (클릭하여 초고 생성)</p>
                {(p.recommended_titles || []).map((title: string) => (
                  <button key={title} onClick={() => handleSelectAndGenerateDraft(title)} disabled={!!isGenerating} className="w-full text-left p-2 rounded-lg border bg-gray-50 hover:bg-green-50 text-sm transition-all flex items-center justify-between group disabled:opacity-50">
                    <span className="flex-1">{title}</span>
                    {isGenerating === title ? <Loader className="h-4 w-4 animate-spin flex-shrink-0 ml-2" /> : <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-transform group-hover:translate-x-1" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default NewIdeaResults;