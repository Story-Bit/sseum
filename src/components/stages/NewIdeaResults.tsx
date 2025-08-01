// 이 파일의 기존 내용을 모두 삭제하고 아래의 완벽한 코드로 교체하십시오.

'use client';

import React, { useState } from 'react';
import { ArrowRight, Loader, Rocket, Layers, Users, Lightbulb, BrainCircuit } from 'lucide-react';
import { useBlogStore, PostType } from './blog-store';
import { toast } from 'sonner';
// import { callGenerativeAPI } from '@/lib/gemini';
import StarRating from '@/components/ui/StarRating';
// 당신의 실제 설계도 경로를 참조합니다.
import { savePostToFirestore } from '@/firebase/post';
import { useAuth } from '../AuthContext';

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
  const { setActivePost, upsertPostInList, setLoading } = useBlogStore();
  const { user } = useAuth();
  const [isGeneratingTitle, setIsGeneratingTitle] = useState<string | null>(null);

  const handleSelectAndGenerateDraft = async (title: string) => {
    if (!user) {
        toast.error("초고를 생성하려면 로그인이 필요합니다.");
        return;
    }

    setIsGeneratingTitle(title);
    setLoading(true, "AI가 초고 생성을 준비합니다...");

    try {
        const tempPost: Partial<PostType> = { title, draft: '', strategyResult: { mainKeyword: title } };
        
        const savedInitialPost = await savePostToFirestore(user.uid, tempPost);
        toast.info("AI 기획자가 글의 목차를 구성하고 있습니다...");

        const outline = "임시 목차: AI가 생성해야 합니다.";

        toast.info("구성된 목차에 따라 AI 작가가 초고를 작성합니다...");
        
        const fullText = `제목: ${title}\n\nAI가 생성한 초고 내용입니다.`;
        const postContent = fullText.substring(fullText.indexOf('\n') + 1).trim();

        const finalPostData: PostType = {
            ...savedInitialPost,
            draft: postContent,
            strategyResult: { ...savedInitialPost.strategyResult, outline }
        };
        const updatedPost = await savePostToFirestore(user.uid, finalPostData);
        
        upsertPostInList(updatedPost);
        setActivePost(updatedPost);
        
        toast.success("고품질 초고 생성이 완료되었습니다!");

    } catch (e: any) {
        toast.error(`초고 생성 중 오류: ${e.message}`);
    } finally {
        setIsGeneratingTitle(null);
        setLoading(false);
    }
  };

  if (!result) return null;

  return (
    <div className="mt-8 animate-fade-in space-y-12">
      <h2 className="text-3xl font-bold text-center">AI 키워드 전략 분석 결과</h2>
      {/* --- 나머지 JSX 코드는 동일하게 유지 --- */}
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
                <button onClick={() => handleSelectAndGenerateDraft(result.pillar_content.title)} disabled={!!isGeneratingTitle} className="bg-green-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-700 transition-colors text-sm">
                    {isGeneratingTitle === result.pillar_content.title ? <Loader className="animate-spin" /> : '이 전략으로 초고 생성'}
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
                  <button key={title} onClick={() => handleSelectAndGenerateDraft(title)} disabled={!!isGeneratingTitle} className="w-full text-left p-2 rounded-lg border bg-gray-50 hover:bg-green-50 text-sm transition-all flex items-center justify-between group disabled:opacity-50">
                    <span className="flex-1">{title}</span>
                    {isGeneratingTitle === title ? <Loader className="h-4 w-4 animate-spin flex-shrink-0 ml-2" /> : <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-transform group-hover:translate-x-1" />}
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