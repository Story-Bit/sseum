'use client';

import React, { useState } from 'react';
import { useBlogStore, PostType } from './blog-store';
import { useAuth } from '../AuthContext';
import { toast } from 'sonner';
import { savePostToFirestore } from '@/firebase/post';
import { callGenerativeAPI } from '@/lib/gemini';
import { ArrowRight, Loader, Rocket, Layers, Users, Lightbulb, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';

// '씀1' 디자인에 있던 별점 컴포넌트를 제련합니다.
const StarRating: React.FC<{ score: number }> = ({ score }) => {
    return (
        <div className="flex">
            {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < score ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

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
  const { setActivePost, upsertPostInList, setLoading, setCurrentStage } = useBlogStore();
  const { user } = useAuth();
  const [isGeneratingTitle, setIsGeneratingTitle] = useState<string | null>(null);

  const handleSelectAndGenerateDraft = async (title: string) => {
    if (!user) { toast.error("초고를 생성하려면 로그인이 필요합니다."); return; }
    
    setIsGeneratingTitle(title);
    setLoading(true, "AI가 초고 생성을 준비합니다...");

    try {
        const tempPost: Partial<PostType> = { title, draft: '', strategyResult: { mainKeyword: title } };
        const savedInitialPost = await savePostToFirestore(user.uid, tempPost);
        toast.info("AI 기획자가 글의 목차를 구성하고 있습니다...");

        const selectedBlogType = blogType || '정보성 콘텐츠';
        const typeGuideline = BLOG_TYPE_GUIDELINES[selectedBlogType];
        
        const outlinePrompt = `<role>당신은 네이버 블로그 전문 콘텐츠 기획자입니다.</role><task>다음 주제와 블로그 유형에 맞춰, 서론-본론-결론 구조를 갖춘 상세한 목차를 생성해주세요. 본론에는 최소 3~5개 이상의 소제목이 포함되어야 합니다.</task>\n\n주제: "${title}"\n블로그 유형: ${selectedBlogType} (${typeGuideline.length})`;
        const schema = { type: "OBJECT", properties: { outline: { type: "STRING" } }, required: ["outline"] };
        const outlineResult = await callGenerativeAPI(outlinePrompt, schema);
        const outline = outlineResult.outline;
        if (!outline) throw new Error("AI가 목차를 생성하지 못했습니다.");

        toast.info("구성된 목차에 따라 AI 작가가 초고를 작성합니다...");
        const finalStyleGuide = localStorage.getItem('userStyleGuide') || `- 서두: 독자의 공감을 유도하는 질문이나 문제 제기로 시작한다.\n- 문체: 친근하고 설득력 있는 말투를 사용하며, "저", "여러분" 같은 표현을 자연스럽게 쓴다. AI 느낌이 나지 않도록 사람이 직접 쓴 것처럼 작성한다.\n- 구조: 짧은 문단과 줄 바꿈을 활용하여 가독성을 높인다.`;
        
        const draftPrompt = `<role>당신은 '${selectedBlogType}' 유형의 글을 쓰는 '${typeGuideline.role}'입니다.</role><task>아래의 모든 지시사항을 엄격히 준수하여, 독자가 끝까지 읽을 수밖에 없는 고품질 블로그 포스트 초고를 한국어로 작성해주십시오.</task><strict_rules>1. **목표 분량 절대 준수**: 최종 결과물은 반드시 **'${typeGuideline.length}'** 범위에 맞춰야 합니다. 2. **AI 정체성 숨기기**: 본문에 AI이거나, AI로서의 경력을 절대 언급하지 마십시오. 3. **가독성 최우선**: 모든 문장은 1~2줄을 넘지 않도록 짧게 작성하고, 2~3문장마다 문단을 나누어 모바일 가독성을 극대화하십시오. 4. **목차 완벽 준수**: 아래 제공된 [목차]의 구조와 내용을 반드시 충실하게 따르십시오.</strict_rules><content_instructions>- **주제**: ${title}\n- **목차**: ${outline}</content_instructions><style_instructions>- **핵심 스타일 가이드**: ${typeGuideline.style}\n- **작성자 개인 스타일 가이드**: ${finalStyleGuide}\n- **기본 구조**: '제목: ...' 형식으로 시작하며, 서론, 본론(소제목은 '##' 사용), 결론 순서로 작성하십시오.</style_instructions>---[최종 초고 출력]:`;
        
        const fullText = await callGenerativeAPI(draftPrompt);
        const titleMatch = fullText.match(/^(제목|Title):\s*(.*)/im);
        const newTitle = titleMatch ? titleMatch[2] : title;
        const postContent = titleMatch ? fullText.substring(fullText.indexOf('\n') + 1).trim() : fullText;

        const finalPostData: PostType = { ...savedInitialPost, title: newTitle, draft: postContent, strategyResult: { ...savedInitialPost.strategyResult, outline } };
        const updatedPost = await savePostToFirestore(user.uid, finalPostData);
        
        upsertPostInList(updatedPost);
        setActivePost(updatedPost);
        setCurrentStage('refinement');
        toast.success("고품질 초고 생성이 완료! 퇴고실로 이동합니다.");

    } catch (e: any) {
        toast.error(`초고 생성 중 오류: ${e.message}`);
        setCurrentStage('strategy');
    } finally {
        setIsGeneratingTitle(null);
        setLoading(false);
    }
  };

  if (!result || Object.keys(result).length === 0) return <div className="text-center p-8">분석 결과가 없습니다.</div>;

  return (
    <div className="animate-fade-in space-y-12">
      <h2 className="text-3xl font-bold text-center">AI 키워드 전략 분석 결과</h2>
      
      {result.kos_scores && (
        <section>
          <h3 className="text-xl font-bold mb-4 flex items-center"><Rocket className="w-6 h-6 mr-3 text-red-500"/>키워드 기회 점수 (KOS)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.kos_scores.map((item: any, index: number) => (
              <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-gray-800">{item.keyword}</p>
                  <StarRating score={Math.round(item.score)} />
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>월간 검색량: {item.search_volume}</p>
                  <p>콘텐츠 포화도: {item.content_saturation}</p>
                  <p>광고 경쟁: {item.ad_competition}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {result.clusters && (
        <section>
          <h3 className="text-xl font-bold mb-4 flex items-center"><Layers className="w-6 h-6 mr-3 text-blue-500"/>주제별 키워드 클러스터</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.clusters.map((cluster: any, index: number) => (
              <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
                <p className="font-bold mb-3 text-blue-800">{cluster.name}</p>
                <div className="flex flex-wrap gap-2">
                  {(cluster.keywords || []).map((kw: string) => <span key={kw} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{kw}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {result.personas && (
        <section>
          <h3 className="text-xl font-bold mb-4 flex items-center"><Users className="w-6 h-6 mr-3 text-purple-500"/>타겟 독자 및 추천 글감</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {result.personas.map((p: any, index: number) => (
              <div key={index} className="bg-white p-5 rounded-lg border shadow-sm h-full flex flex-col">
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
                    <Button key={title} onClick={() => handleSelectAndGenerateDraft(title)} disabled={!!isGeneratingTitle} variant="outline" size="sm" className="w-full justify-between text-left h-auto">
                      <span className="flex-1 whitespace-normal">{title}</span>
                      {isGeneratingTitle === title ? <Loader className="h-4 w-4 animate-spin flex-shrink-0 ml-2" /> : <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-transform group-hover:translate-x-1" />}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default NewIdeaResults;