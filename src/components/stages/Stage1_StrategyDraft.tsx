// /src/components/stages/Stage1_StrategyDraft.tsx

'use client';

import { useState, useMemo } from 'react';
import { create } from 'zustand';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Rocket, Library, Lightbulb, Users, Target, ArrowLeft } from 'lucide-react';
import { toast } from "sonner";

// 타입 정의
export interface KOSResult { keyword: string; kosScore: number; explanation: string; }
export interface TopicCluster { mainTopic: string; subTopics: string[]; }
export interface RecommendedPost { title: string; tactic: string; }
export interface Persona { name: string; description: string; recommendedPosts: RecommendedPost[]; }
export interface StrategyDetails { pillarContent: string; topicClusters: TopicCluster[]; personas: Persona[]; }

// 중앙 상태 관리소 (Zustand)
interface StrategyState {
  kosResults: KOSResult[] | null;
  strategyDetails: StrategyDetails | null;
  isLoading: boolean;
  isDetailLoading: boolean;
  setKosResults: (results: KOSResult[] | null) => void;
  setStrategyDetails: (details: StrategyDetails | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsDetailLoading: (loading: boolean) => void;
  resetStrategy: () => void;
}

export const useStrategyStore = create<StrategyState>((set) => ({
  kosResults: null,
  strategyDetails: null,
  isLoading: false,
  isDetailLoading: false,
  setKosResults: (results) => set({ kosResults: results, strategyDetails: null }),
  setStrategyDetails: (details) => set({ strategyDetails: details }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsDetailLoading: (loading) => set({ isDetailLoading: loading }),
  resetStrategy: () => set({ kosResults: null, strategyDetails: null, isLoading: false, isDetailLoading: false }),
}));

// 메인 제어실
export default function Stage1_StrategyDraft() {
  const { 
    kosResults, strategyDetails, isLoading, isDetailLoading, 
    setKosResults, setStrategyDetails, setIsLoading, setIsDetailLoading, resetStrategy 
  } = useStrategyStore();
  
  const [mainKeyword, setMainKeyword] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  const handleInitialAnalysis = async () => {
    if (!mainKeyword.trim()) return toast.error("분석할 키워드를 입력하십시오.");
    
    setIsLoading(true);
    resetStrategy();
    const toastId = toast.loading("핵심 기회 키워드를 분석 중입니다...");

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'analyzeKeywords', payload: { mainKeyword } }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      const data = await response.json();
      
      setKosResults(data.kosResults);
      if (data.kosResults && data.kosResults.length > 0) {
        handleKeywordSelect(data.kosResults[0].keyword); // 첫 번째 키워드를 자동으로 선택
      }
      toast.success("핵심 기회 분석 완료!", { id: toastId });
    } catch (err: any) {
      toast.error(`오류: ${err.message}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeywordSelect = async (keyword: string) => {
    setSelectedKeyword(keyword);
    setIsDetailLoading(true);
    setStrategyDetails(null); // 이전 상세 정보 초기화

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'generateStrategyDetails', payload: { selectedKeyword: keyword } }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      const data = await response.json();
      setStrategyDetails(data);
    } catch (err: any) {
      toast.error(`상세 전략 로딩 오류: ${err.message}`);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleGeneratePillarPost = async () => {
    if (!strategyDetails || !selectedKeyword) return;
    
    const toastId = toast.loading("네이버 SEO에 최적화된 초고를 생성 중입니다...");
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                task: 'generatePillarPost',
                payload: {
                    selectedKeyword: selectedKeyword,
                    pillarContentStrategy: strategyDetails.pillarContent
                }
            }),
        });
        if (!response.ok) throw new Error((await response.json()).error);
        const post = await response.json();
        
        // TODO: 생성된 post(title, content)를 다음 스테이지로 넘기는 로직 구현
        console.log("생성된 초고:", post);
        toast.success("초고 생성이 완료되었습니다!", { id: toastId, description: "다음 단계에서 확인하십시오." });

    } catch (err: any) {
        toast.error(`초고 생성 오류: ${err.message}`, { id: toastId });
    }
  };


  if (isLoading) {
    return <div className="flex flex-col items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin" /><p className="mt-4">전략 분석 중...</p></div>;
  }
  
  if (kosResults) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-12">
        <Button variant="ghost" onClick={resetStrategy}><ArrowLeft className="mr-2 h-4 w-4" />새로운 전략 분석</Button>
        {/* 1. 기회의 신탁 (KOS) */}
        <section>
          <CardTitle className="flex items-center text-2xl mb-4"><Rocket className="mr-3 h-7 w-7 text-red-500" />기회의 신탁: 핵심 기회 분석</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kosResults.map((item) => (
              <Card key={item.keyword} onClick={() => handleKeywordSelect(item.keyword)} className={`p-4 cursor-pointer transition-all ${selectedKeyword === item.keyword ? 'border-primary ring-2 ring-primary shadow-xl' : 'hover:shadow-md'}`}>
                <div className="flex justify-between items-start"><h3 className="font-bold text-lg">{item.keyword}</h3><Badge>{item.kosScore}점</Badge></div>
                <p className="text-sm text-muted-foreground mt-2">{item.explanation}</p>
              </Card>
            ))}
          </div>
        </section>

        {isDetailLoading && <div className="flex flex-col items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin" /><p className="mt-4">선택된 키워드에 맞춰 전략을 재구성 중...</p></div>}
        
        {strategyDetails && !isDetailLoading && (
          <>
            {/* 2. 구조의 베틀 (필러 & 클러스터) */}
            <section>
              <CardTitle className="flex items-center text-2xl mb-4"><Library className="mr-3 h-7 w-7 text-blue-500" />구조의 베틀: 콘텐츠 설계도</CardTitle>
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 p-6">
                <h3 className="flex items-center font-semibold text-lg mb-2"><Lightbulb className="mr-2 h-5 w-5 text-green-600" />추천 필러 콘텐츠 전략</h3>
                <p className="text-base text-green-800 dark:text-green-300">{strategyDetails.pillarContent}</p>
                <Button onClick={handleGeneratePillarPost} className="mt-4 bg-green-600 hover:bg-green-700">이 전략으로 필러 콘텐츠 초고 생성</Button>
              </Card>
              <CardDescription className="mt-6 mb-4">하나의 강력한 주제를 중심으로 여러 글을 연결하여, 네이버 C-Rank가 선호하는 '주제 전문가' 블로그를 구축하십시오.</CardDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {strategyDetails.topicClusters.map((c) => (<div key={c.mainTopic} className="p-4 border rounded-lg"><h4 className="font-medium">{c.mainTopic}</h4><div className="flex flex-wrap gap-2 mt-2">{c.subTopics.map((st) => (<Badge key={st} variant="outline">{st}</Badge>))}</div></div>))}
              </div>
            </section>
            {/* 3. 실행의 모루 (페르소나 & 글감) */}
            <section>
              <CardTitle className="flex items-center text-2xl mb-4"><Users className="mr-3 h-7 w-7 text-purple-500" />실행의 모루: 타겟 독자 공략</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {strategyDetails.personas.map((p, idx) => (<Card key={p.name} className={`flex flex-col ${idx === 0 ? 'border-purple-400 ring-2 ring-purple-300' : ''}`}><CardHeader className={`${idx === 0 ? 'bg-purple-50' : ''}`}><h3 className="flex font-bold text-lg">{idx === 0 && <Target className="mr-2 h-5 w-5" />}핵심 타겟: {p.name}</h3><CardDescription>{p.description}</CardDescription></CardHeader><CardContent className="flex-grow space-y-3">{p.recommendedPosts.map((post) => (<div key={post.title} className="p-3 border rounded-md"><p className="font-medium">{post.title}</p><p className="text-sm text-blue-600 mt-1">[AI 공략 비급] {post.tactic}</p></div>))}</CardContent></Card>))}
              </div>
            </section>
          </>
        )}
      </div>
    );
  }

  // 기본 입력 UI
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-lg">
        <CardHeader><CardTitle>콘텐츠 전략 수립</CardTitle><CardDescription>분석할 핵심 주제를 입력하여 전략 수립을 시작하세요.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="예: 제미나이 API" value={mainKeyword} onChange={(e) => setMainKeyword(e.target.value)} />
          <Button onClick={handleInitialAnalysis} disabled={isLoading} className="w-full">AI 키워드 전략 분석</Button>
        </CardContent>
      </Card>
    </div>
  );
}