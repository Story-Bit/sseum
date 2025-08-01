'use client';

import React, { ReactNode, useState, useCallback } from 'react';
import { Sparkles, Target, Loader, ArrowLeft } from 'lucide-react';
import { useBlogStore } from './blog-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// 하위 컴포넌트들은 별도의 파일로 분리하는 것이 이상적이나,
// 현재 설계도를 존중하여 이 파일 안에 유지합니다.
const StrategyCard: React.FC<{ icon: ReactNode; title: string; description: string; onClick: () => void }> = ({ icon, title, description, onClick }) => (
    <div onClick={onClick} className="p-8 text-center bg-white rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer transition-all duration-300 transform hover:-translate-y-2">
        <div className="text-5xl mb-4 text-blue-500 inline-block bg-blue-100 p-4 rounded-full">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-2">{description}</p>
    </div>
);

// --- 전략실의 심장부 ---
const Stage1_StrategyDraft = () => {
    // 1. 모든 전역 상태는 useBlogStore에서 가져와 일관성을 유지합니다.
    const { strategyResult, setStrategyResult, isLoading, setLoading } = useBlogStore();
    
    // 2. 이 컴포넌트 내부에서만 사용하는 UI 상태는 useState로 관리합니다.
    const [view, setView] = useState<'select_strategy' | 'select_blog_type' | 'input_topic' | 'input_competitor' | 'show_result'>('select_strategy');
    const [topic, setTopic] = useState('');
    const [competitorContent, setCompetitorContent] = useState('');
    const [blogType, setBlogType] = useState('');

    // 3. API 호출 로직은 useCallback으로 감싸 안정성을 확보합니다.
    const handleAnalysis = useCallback(async (strategyType: 'new_idea' | 'competitor') => {
        setLoading(true, 'AI가 분석을 시작합니다...');
        try {
            // 실제 API 호출 로직 (현재는 임시 데이터로 대체)
            // const response = await fetch('/api/generate', { ... });
            // const result = await response.json();
            
            // 임시 결과 데이터
            const result = strategyType === 'new_idea' 
                ? { kos_scores: [], clusters: [], pillar_content: {}, personas: [] } 
                : { content_gap: [], new_outline: "", titles: [] };

            setStrategyResult({ type: strategyType, data: result });
            setView('show_result'); // 분석 완료 후 결과 보기로 전환
            toast.success("전략 분석이 완료되었습니다.");
        } catch (e: any) {
            toast.error(`전략 분석 중 오류: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, [setLoading, setStrategyResult]);

    // UI 렌더링 로직
    const renderBackButton = (action: () => void) => (
        <Button variant="ghost" onClick={action} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4"/> 이전 단계로
        </Button>
    );

    // --- 로딩 중 화면 ---
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Loader className="h-12 w-12 animate-spin text-blue-500" />
                <p className="mt-4 font-semibold text-gray-600">AI가 전략을 수립하고 있습니다...</p>
            </div>
        );
    }

    // --- 각 단계별 화면 ---
    let content;
    switch (view) {
        case 'select_strategy':
            content = (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <StrategyCard icon={<Sparkles />} title="새로운 아이디어로 콘텐츠 만들기" description="주제와 유형을 입력하면 AI가 글감을 제안합니다." onClick={() => setView('select_blog_type')} />
                    <StrategyCard icon={<Target />} title="경쟁사 분석으로 이기는 글쓰기" description="경쟁사 글을 분석하여 더 나은 전략을 제안합니다." onClick={() => setView('input_competitor')} />
                </div>
            );
            break;
        
        case 'select_blog_type':
            content = (
                <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
                    {renderBackButton(() => setView('select_strategy'))}
                    <h3 className="text-2xl font-bold mb-4">어떤 종류의 블로그 글인가요?</h3>
                    {/* BlogTypeSelector 컴포넌트를 사용하거나, 간단한 버튼으로 대체 */}
                    <Button onClick={() => { setBlogType('정보성 블로그'); setView('input_topic'); }}>정보성 블로그</Button>
                </div>
            );
            break;

        case 'input_topic':
            content = (
                <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
                    {renderBackButton(() => setView('select_blog_type'))}
                    <h3 className="text-2xl font-bold mb-4">글의 대주제는 무엇인가요?</h3>
                    <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="예: AI 그림 그리기" className="w-full p-3 border rounded-lg mb-4" />
                    <Button onClick={() => handleAnalysis('new_idea')} className="w-full text-lg">전략 분석</Button>
                </div>
            );
            break;

        case 'input_competitor':
            content = (
                <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
                    {renderBackButton(() => setView('select_strategy'))}
                    <h3 className="text-2xl font-bold mb-4">경쟁사 블로그 본문을 붙여넣으세요.</h3>
                    <Textarea value={competitorContent} onChange={e => setCompetitorContent(e.target.value)} placeholder="경쟁사 글 본문..." className="w-full p-3 border rounded-lg mb-4 h-40" />
                    <Button onClick={() => handleAnalysis('competitor')} className="w-full text-lg">전략 분석</Button>
                </div>
            );
            break;

        case 'show_result':
            content = (
                <div>
                    {renderBackButton(() => { setStrategyResult(null); setView('select_strategy'); })}
                    {/* 결과 표시 컴포넌트들 (NewIdeaResults, CompetitorResults) */}
                    <p>분석 결과가 여기에 표시됩니다.</p>
                </div>
            );
            break;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold text-gray-900">콘텐츠 전략 수립</h2>
                <p className="mt-4 text-lg text-gray-600">어떤 방식으로 글쓰기를 시작할까요? 목표에 맞는 전략을 선택해주세요.</p>
            </div>
            {content}
        </div>
    );
};

export default Stage1_StrategyDraft;