'use client';

import React, { ReactNode, useState, useCallback } from 'react';
import { Sparkles, Target, Loader, ArrowLeft } from 'lucide-react';
import { useBlogStore, StrategyResult } from './blog-store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import NewIdeaResults from './NewIdeaResults';
import CompetitorResults from './CompetitorResults';
import BlogTypeSelector from './BlogTypeSelector';
import { callGenerativeAPI, callChunkedAPI } from '@/lib/gemini';

const StrategyCard: React.FC<{ icon: ReactNode; title: string; description: string; onClick: () => void }> = ({ icon, title, description, onClick }) => (
    <div onClick={onClick} className="p-8 text-center bg-white rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer transition-all duration-300 transform hover:-translate-y-2">
        <div className="text-5xl mb-4 text-blue-500 inline-block bg-blue-100 p-4 rounded-full">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-2">{description}</p>
    </div>
);

const Stage1_StrategyDraft = () => {
    const { strategyResult, setStrategyResult, isLoading, setLoading, loadingMessage } = useBlogStore();
    
    const [strategyType, setStrategyType] = useState<'new_idea' | 'competitor' | null>(null);
    const [blogType, setBlogType] = useState<string | null>(null);
    const [topic, setTopic] = useState('');
    const [competitorContent, setCompetitorContent] = useState('');

    const handleAnalysis = useCallback(async () => {
        if (!strategyType) return;
        
        setLoading(true, 'AI가 분석을 시작합니다...');
        try {
            let apiResult;
            
            if (strategyType === 'new_idea') {
                if (!topic || !blogType) { throw new Error("블로그 유형과 대주제를 모두 선택해주세요."); }
                setLoading(true, 'AI가 시장 조사를 시작합니다...');
                const prompt = `<role>당신은 대한민국 최고의 네이버 트렌드 분석가이자, 15년차 SEO 콘텐츠 전략 전문가입니다.</role><task>사용자가 입력한 대주제인 '[주제: ${topic}]'와 블로그 유형 '[유형: ${blogType}]'에 대해, 다음 4단계의 연쇄적 사고 과정을 거쳐 최종 결과물을 지정된 JSON 형식으로만 응답해야 합니다.</task><process_instruction>1. **KOS 분석**: 유망 키워드 5개 분석 ('score'는 1~5 정수, 'search_volume', 'content_saturation', 'ad_competition' 포함). 2. **주제 클러스터 설계**: 발굴된 키워드 기반 클러스터 3개 생성. 3. **필러 콘텐츠 제안**: 클러스터를 종합하여 필러 콘텐츠 아이디어 1개 제안. 4. **타겟 독자 및 추천 글감**: 클러스터 기반 페르소나 3개 정의 (각 'name', 'pain_point', 'motivation', 'writing_tactic', 'recommended_titles' 4개 포함).</process_instruction>`;
                const schema = { type: "OBJECT", properties: { kos_scores: { type: "ARRAY", items: { type: "OBJECT", properties: { keyword: { type: "STRING" }, score: { type: "NUMBER" }, search_volume: { type: "STRING" }, content_saturation: { type: "STRING" }, ad_competition: { type: "STRING" } } } }, clusters: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, keywords: { type: "ARRAY", items: { type: "STRING" } } } } }, pillar_content: { type: "OBJECT", properties: { title: { type: "STRING" }, description: { type: "STRING" } } }, personas: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, pain_point: { type: "STRING" }, motivation: { type: "STRING" }, writing_tactic: { type: "STRING" }, recommended_titles: { type: "ARRAY", items: { type: "STRING" } } } } } }, required: ["kos_scores", "clusters", "pillar_content", "personas"] };
                apiResult = await callGenerativeAPI(prompt, schema);
            } else { // competitor
                if (!competitorContent) { throw new Error("경쟁사 블로그 본문을 입력해주세요."); }
                setLoading(true, 'AI가 경쟁사의 약점을 분석하고 있습니다...');
                
                const mapPromptTemplate = (chunk: string) => `<role>콘텐츠 분석가</role><task>다음 텍스트 덩어리의 핵심 주장과 주요 특징을 요약하라.</task>\n---텍스트---\n${chunk}`;
                const reducePrompt = (summaries: string) => `<role>최고의 네이버 블로그 SEO 전략가이자, 날카로운 콘텐츠 비평가입니다.</role><task>아래는 경쟁사 블로그를 여러 조각으로 나누어 요약한 내용이다. 이 요약본 전체를 바탕으로, 이 글을 압도할 수 있는 '이기는 콘텐츠' 전략을 다음 2단계 사고 과정에 따라 제안해주십시오. 결과는 반드시 지정된 JSON 형식으로만 응답해야 합니다.</task><process_instruction>1.  **1단계: 콘텐츠 갭 분석**: 경쟁사 글의 강점과 약점을 분석하여, 우리가 공략해야 할 '콘텐츠 갭(차별화 포인트)' 3가지를 찾아냅니다. (결과 키: content_gap)\n2.  **2단계: 전략적 재구성**: 위에서 분석한 '콘Gᅢᆸ'을 완벽하게 해결하는 것을 목표로, 더 나은 '전략적 목차(new_outline)'와 독자의 클릭을 유도하는 '추천 제목(titles)' 3개를 생성합니다.</process_instruction>\n---요약본---\n${summaries}`;
                const schema = { type: "OBJECT", properties: { content_gap: { type: "ARRAY", items: { type: "STRING" } }, new_outline: { type: "STRING" }, titles: { type: "ARRAY", items: { type: "STRING" } } }, required: ["content_gap", "new_outline", "titles"] };

                apiResult = await callChunkedAPI(competitorContent, mapPromptTemplate, reducePrompt, schema);
            }

            const result: StrategyResult = { type: strategyType, data: apiResult };
            setStrategyResult(result);
            toast.success("전략 분석이 완료되었습니다.");
        } catch (e: any) {
            toast.error(`전략 분석 중 오류: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, [strategyType, topic, blogType, competitorContent, setLoading, setStrategyResult]);

    const handleBack = () => {
        if (strategyResult) { setStrategyResult(null); }
        else if (blogType) { setBlogType(null); }
        else if (strategyType) { setStrategyType(null); }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center">
                    <Loader className="mx-auto h-12 w-12 animate-spin text-blue-500" />
                    <p className="mt-4 font-semibold text-gray-600">{loadingMessage}</p>
                </div>
            );
        }
        if (strategyResult) {
            return (
                <div>
                    <Button onClick={handleBack} variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4"/> 다시 분석하기</Button>
                    {strategyResult.type === 'new_idea' && <NewIdeaResults result={strategyResult.data} blogType={blogType} />}
                    {strategyResult.type === 'competitor' && <CompetitorResults result={strategyResult.data} />}
                </div>
            );
        }
        if (strategyType === 'new_idea' && !blogType) {
            return <BlogTypeSelector onSelect={setBlogType} onBack={handleBack} />;
        }
        if (strategyType) {
            return (
                <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
                    <Button onClick={handleBack} variant="ghost" className="mb-6"><ArrowLeft className="mr-2 h-4 w-4"/> 이전 단계로</Button>
                    {strategyType === 'new_idea' ? (
                        <Input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="글의 대주제는 무엇인가요? (예: AI 그림 그리기)" className="w-full p-3 border rounded-lg mb-4" />
                    ) : (
                        <Textarea value={competitorContent} onChange={e => setCompetitorContent(e.target.value)} placeholder="경쟁사 블로그 본문을 여기에 붙여넣어 주세요." className="w-full p-3 border rounded-lg mb-4 h-40" />
                    )}
                    <Button onClick={handleAnalysis} className="w-full text-lg">전략 분석</Button>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <StrategyCard icon={<Sparkles />} title="새로운 아이디어로 콘텐츠 만들기" description="콘텐츠 유형을 선택하고 주제를 입력하면 AI가 글감을 제안합니다." onClick={() => setStrategyType('new_idea')} />
                <StrategyCard icon={<Target />} title="경쟁사 분석으로 이기는 글쓰기" description="경쟁사 글을 입력하면 AI가 약점을 분석하고 더 나은 전략을 제안합니다." onClick={() => setStrategyType('competitor')} />
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold text-gray-900">콘텐츠 전략 수립</h2>
                <p className="mt-4 text-lg text-gray-600">어떤 방식으로 글쓰기를 시작할까요? 목표에 맞는 전략을 선택해주세요.</p>
            </div>
            {renderContent()}
        </div>
    );
};

export default Stage1_StrategyDraft;