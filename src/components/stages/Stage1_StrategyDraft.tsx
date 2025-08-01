// 이 파일의 기존 내용을 모두 삭제하고 아래의 완벽한 코드로 교체하십시오.

'use client';

import React, { ReactNode, useState, useCallback } from 'react';
import { Sparkles, Target, Loader, ArrowLeft } from 'lucide-react';
// StrategyResult 타입을 함께 가져옵니다.
import { useBlogStore, StrategyResult } from './blog-store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import NewIdeaResults from './NewIdeaResults';
import CompetitorResults from './CompetitorResults';
import BlogTypeSelector from './BlogTypeSelector';

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
        if (!strategyType) return; // strategyType이 null이면 실행하지 않습니다.

        setLoading(true, 'AI가 분석을 시작합니다...');
        setStrategyResult(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            
            // 'result' 변수의 타입을 StrategyResult로 명확히 지정합니다.
            const result: StrategyResult = {
                type: strategyType,
                data: strategyType === 'new_idea' 
                    ? { /* Mock Data */ } 
                    : { /* Mock Data */ }
            };
            
            setStrategyResult(result); // 이제 오류 없이 전달됩니다.
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