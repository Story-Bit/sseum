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
                const prompt = `<role>15년차 SEO 콘텐츠 전략가</role><task>'[주제: ${topic}]'와 '[유형: ${blogType}]'에 대해, 가장 유망한 '롱테일 키워드' 5개와, 그 키워드를 바탕으로 한 '타겟 독자 페르소나' 2개를 정의하고, 각 페르소나별 '추천 글감' 3개를 제안하라.</task><output_format>결과는 반드시 'keywords'와 'personas' 키를 포함한 JSON 형식이어야 합니다. 페르소나는 'name', 'description', 'titles'를 포함해야 합니다.</output_format>`;
                const schema = { type: "OBJECT", properties: { keywords: { type: "ARRAY", items: { type: "STRING" } }, personas: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, description: { type: "STRING" }, titles: { type: "ARRAY", items: { type: "STRING" } } } } } }, required: ["keywords", "personas"] };
                apiResult = await callGenerativeAPI(prompt, schema);
            } else { // competitor
                if (!competitorContent) { throw new Error("경쟁사 블로그 본문을 입력해주세요."); }
                setLoading(true, 'AI가 경쟁사의 약점을 분석하고 있습니다...');
                
                const mapPromptTemplate = (chunk: string) => `<role>콘텐츠 분석가</role><task>다음 텍스트 덩어리의 핵심 주장과 주요 특징을 요약하라.</task>\n---텍스트---\n${chunk}`;
                const reducePrompt = (summaries: string) => `<role>최고의 SEO 전략가</role><task>아래는 경쟁사 블로그를 여러 조각으로 나누어 요약한 내용이다. 이 요약본 전체를 바탕으로, 공략할 '콘텐츠 갭' 3가지와 '추천 제목' 3개를 제안하라.</task><output_format>결과는 'content_gap'과 'titles' 키를 포함한 JSON 형식이어야 한다.</output_format>\n---요약본---\n${summaries}`;
                const schema = { type: "OBJECT", properties: { content_gap: { type: "ARRAY", items: { type: "STRING" } }, titles: { type: "ARRAY", items: { type: "STRING" } } }, required: ["content_gap", "titles"] };

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