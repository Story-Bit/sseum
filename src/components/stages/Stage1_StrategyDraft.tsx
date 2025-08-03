// /src/components/stages/Stage1_StrategyDraft.tsx

'use client';

import { useState, useMemo } from 'react';
import { create } from 'zustand';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Rocket, Library, Lightbulb, Users, Target, ArrowLeft, Save } from 'lucide-react';
import { toast } from "sonner";

// 타입 정의
export interface KOSResult { keyword: string; kosScore: number; explanation: string; }
export interface TopicCluster { mainTopic: string; subTopics: string[]; }
export interface RecommendedPost { title: string; tactic: string; }
export interface Persona { name: string; description: string; recommendedPosts: RecommendedPost[]; }
export interface StrategyDetails { pillarContent: string; topicClusters: TopicCluster[]; personas: Persona[]; }
export interface StrategyData { kosResults: KOSResult[]; strategyDetails: StrategyDetails; mainKeyword: string; id?: string; }


// 중앙 상태 관리소 (Zustand)
interface StrategyState {
  strategyId: string | null;
  mainKeyword: string | null;
  kosResults: KOSResult[] | null;
  strategyDetails: StrategyDetails | null;
  isLoading: boolean;
  isDetailLoading: boolean;
  setStrategyData: (data: Partial<StrategyState>) => void;
  resetStrategy: () => void;
}

export const useStrategyStore = create<StrategyState>((set) => ({
  strategyId: null,
  mainKeyword: null,
  kosResults: null,
  strategyDetails: null,
  isLoading: false,
  isDetailLoading: false,
  setStrategyData: (data) => set((state) => ({ ...state, ...data })),
  resetStrategy: () => set({ kosResults: null, strategyDetails: null, isLoading: false, isDetailLoading: false, mainKeyword: null, strategyId: null }),
}));


// 메인 제어실
export default function Stage1_StrategyDraft() {
    const {
        strategyId, mainKeyword: storedKeyword, kosResults, strategyDetails, isLoading, isDetailLoading,
        setStrategyData, resetStrategy
    } = useStrategyStore();

    const [mainKeywordInput, setMainKeywordInput] = useState('');
    const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
    
    // API 호출 로직들
    const handleInitialAnalysis = async () => {
        if (!mainKeywordInput.trim()) return toast.error("분석할 키워드를 입력하십시오.");
        setStrategyData({ isLoading: true, mainKeyword: mainKeywordInput });
        const toastId = toast.loading("핵심 기회 키워드를 분석 중입니다...");
        try {
            const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: 'analyzeKeywords', payload: { mainKeyword: mainKeywordInput } }) });
            if (!res.ok) throw new Error((await res.json()).error);
            const data = await res.json();
            setStrategyData({ kosResults: data.kosResults });
            if (data.kosResults?.length > 0) {
                await handleKeywordSelect(data.kosResults[0].keyword);
            }
            toast.success("핵심 기회 분석 완료!", { id: toastId });
        } catch (err: any) { toast.error(`오류: ${err.message}`, { id: toastId }); resetStrategy(); } 
        finally { setStrategyData({ isLoading: false }); }
    };

    const handleKeywordSelect = async (keyword: string) => {
        setSelectedKeyword(keyword);
        setStrategyData({ isDetailLoading: true, strategyDetails: null });
        try {
            const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: 'generateStrategyDetails', payload: { selectedKeyword: keyword } }) });
            if (!res.ok) throw new Error((await res.json()).error);
            const data = await res.json();
            setStrategyData({ strategyDetails: data });
        } catch (err: any) { toast.error(`상세 전략 로딩 오류: ${err.message}`); } 
        finally { setStrategyData({ isDetailLoading: false }); }
    };

    const handleGeneratePost = async (task: string, payload: object) => {
        const toastId = toast.loading("네이버 SEO에 최적화된 초고를 생성 중입니다...");
        try {
            const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task, payload }) });
            if (!res.ok) throw new Error((await res.json()).error);
            const post = await res.json();
            console.log("생성된 초고:", post); // TODO: 생성된 초고를 다음 단계로 전달
            toast.success("초고 생성이 완료되었습니다!", { id: toastId, description: "다음 단계에서 확인하십시오." });
        } catch (err: any) { toast.error(`초고 생성 오류: ${err.message}`, { id: toastId }); }
    };
    
    // [명령 3] 전략 저장 기능
    const handleSaveStrategy = async () => {
        if (!kosResults || !strategyDetails || !storedKeyword) return toast.error("저장할 분석 데이터가 없습니다.");
        const toastId = toast.loading("현재 전략을 저장 중입니다...");
        try {
            const res = await fetch('/api/strategies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mainKeyword: storedKeyword, kosResults, strategyDetails, id: strategyId })
            });
            if (!res.ok) throw new Error((await res.json()).error);
            const { id } = await res.json();
            setStrategyData({ strategyId: id });
            toast.success("전략이 성공적으로 저장되었습니다!", { id: toastId });
        } catch (err: any) {
            toast.error(`전략 저장 오류: ${err.message}`, { id: toastId });
        }
    };


    if (isLoading) return <div className="flex flex-col items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin" /><p className="mt-4">전략 분석 중...</p></div>;

    if (kosResults) return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-12">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={resetStrategy}><ArrowLeft className="mr-2 h-4 w-4" />새로운 전략 분석</Button>
                <Button onClick={handleSaveStrategy}><Save className="mr-2 h-4 w-4" /> {strategyId ? '전략 업데이트' : '이 전략 저장하기'}</Button>
            </div>
            <section>
                <CardTitle className="flex items-center text-2xl mb-4"><Rocket className="mr-3 h-7 w-7 text-red-500" />기회의 신탁: 핵심 기회 분석</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kosResults.map((item) => <Card key={item.keyword} onClick={() => handleKeywordSelect(item.keyword)} className={`p-4 cursor-pointer transition-all ${selectedKeyword === item.keyword ? 'border-primary ring-2 ring-primary shadow-xl' : 'hover:shadow-md'}`}><div className="flex justify-between"><h3 className="font-bold text-lg">{item.keyword}</h3><Badge>{item.kosScore}점</Badge></div><p className="text-sm text-muted-foreground mt-2">{item.explanation}</p></Card>)}
                </div>
            </section>
            {isDetailLoading && <div className="flex flex-col items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin" /><p className="mt-4">전략 재구성 중...</p></div>}
            {strategyDetails && !isDetailLoading && <>
                <section>
                    <CardTitle className="flex items-center text-2xl mb-4"><Library className="mr-3 h-7 w-7 text-blue-500" />구조의 베틀: 콘텐츠 설계도</CardTitle>
                    <Card className="bg-green-50 dark:bg-green-900/20 p-6">
                        <h3 className="flex items-center font-semibold text-lg mb-2"><Lightbulb className="mr-2 h-5 w-5" />추천 필러 콘텐츠 전략</h3>
                        <p>{strategyDetails.pillarContent}</p>
                        <Button onClick={() => handleGeneratePost('generatePillarPost', { selectedKeyword, pillarContentStrategy: strategyDetails.pillarContent })} className="mt-4">종합 필러 콘텐츠 생성</Button>
                    </Card>
                    <CardDescription className="mt-6 mb-4">하나의 강력한 주제를 중심으로 여러 글을 연결하여, 네이버 C-Rank가 선호하는 '주제 전문가' 블로그를 구축하십시오.</CardDescription>
                    <div className="space-y-4">
                        {strategyDetails.topicClusters.map((c) => (<div key={c.mainTopic} className="p-4 border rounded-lg"><h4 className="font-medium text-lg mb-3">{c.mainTopic}</h4><div className="flex flex-wrap gap-2">{c.subTopics.map((st) => (<Button key={st} variant="outline" size="sm" onClick={() => handleGeneratePost('generateClusterPost', { mainKeyword: storedKeyword, subTopic: st })}>{st} 초고 생성</Button>))}</div></div>))}
                    </div>
                </section>
                <section>
                    <CardTitle className="flex items-center text-2xl mb-4"><Users className="mr-3 h-7 w-7 text-purple-500" />실행의 모루: 타겟 독자 공략</CardTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {strategyDetails.personas.map((p, idx) => (<Card key={p.name} className={`flex flex-col ${idx === 0 ? 'border-purple-400' : ''}`}><CardHeader className={`${idx === 0 ? 'bg-purple-50' : ''}`}><h3 className="flex items-center font-bold text-lg">{idx === 0 && <Target className="mr-2 h-5 w-5" />}핵심 타겟: {p.name}</h3><CardDescription>{p.description}</CardDescription></CardHeader><CardContent className="flex-grow space-y-3">{p.recommendedPosts.map((post) => (<div key={post.title} className="p-3 border rounded-md flex flex-col justify-between h-full"><p className="font-medium">{post.title}</p><p className="text-sm text-blue-600 mt-1">[AI 공략 비급] {post.tactic}</p><Button size="sm" variant="ghost" className="w-full justify-start h-auto p-1 mt-2 text-primary" onClick={() => handleGeneratePost('generatePersonaPost', { personaName: p.name, ...post })}>이 글감으로 초고 생성 →</Button></div>))}</CardContent></Card>))}
                    </div>
                </section>
            </>}
        </div>
    );

    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-lg">
                <CardHeader><CardTitle>콘텐츠 전략 수립</CardTitle><CardDescription>분석할 주제를 입력하세요.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <Input placeholder="예: 제미나이 API" value={mainKeywordInput} onChange={(e) => setMainKeywordInput(e.target.value)} />
                    <Button onClick={handleInitialAnalysis} disabled={isLoading} className="w-full">AI 키워드 전략 분석</Button>
                </CardContent>
            </Card>
        </div>
    );
}