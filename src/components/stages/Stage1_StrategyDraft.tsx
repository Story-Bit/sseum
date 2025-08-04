// /src/components/stages/Stage1_StrategyDraft.tsx

'use client';

import { useState, useMemo, useEffect, FC } from 'react';
import { create } from 'zustand';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Rocket, Library, Users, Target, ArrowLeft, Save, FolderClock, FileText, Swords, Trash2 } from 'lucide-react';
import { toast } from "sonner";

// --- 타입 정의 ---
export interface KOSResult { keyword: string; kosScore: number; explanation: string; }
export interface TopicCluster { mainTopic: string; subTopics: string[]; }
export interface RecommendedPost { title: string; tactic: string; }
export interface Persona { name: string; description: string; recommendedPosts: RecommendedPost[]; }
export interface StrategyDetails { topicClusters: TopicCluster[]; personas: Persona[]; }
export interface SavedStrategy { id: string; mainKeyword: string; updatedAt: string; }
export interface FullStrategyData { id?: string; mainKeyword: string; kosResults: KOSResult[]; strategyDetails: StrategyDetails | null; }
export interface CompetitorAnalysisResult { analysis: string; suggestedTitles: string[]; suggestedOutline: string; }

// --- 중앙 상태 관리소 (Zustand) ---
interface StrategyState {
  savedStrategies: SavedStrategy[];
  currentStrategy: FullStrategyData | null;
  competitorResult: CompetitorAnalysisResult | null;
  isLoading: boolean;
  setSavedStrategies: (strategies: SavedStrategy[]) => void;
  removeSavedStrategy: (strategyId: string) => void;
  setCurrentStrategy: (strategy: FullStrategyData | null) => void;
  setCompetitorResult: (result: CompetitorAnalysisResult | null) => void;
  setLoading: (status: boolean) => void;
  reset: () => void;
}

export const useStrategyStore = create<StrategyState>((set) => ({
  savedStrategies: [],
  currentStrategy: null,
  competitorResult: null,
  isLoading: false,
  setSavedStrategies: (strategies) => set({ savedStrategies: strategies }),
  removeSavedStrategy: (strategyId) => set((state) => ({ savedStrategies: state.savedStrategies.filter(s => s.id !== strategyId) })),
  setCurrentStrategy: (strategy) => set({ currentStrategy: strategy, competitorResult: null }),
  setCompetitorResult: (result) => set({ competitorResult: result, currentStrategy: null }),
  setLoading: (status) => set({ isLoading: status }),
  reset: () => set({ currentStrategy: null, competitorResult: null, isLoading: false }),
}));

// --- 결과 표시 컴포넌트 1: 키워드 전략 ---
const KeywordStrategyResultDisplay: FC = () => {
    const { currentStrategy, setCurrentStrategy, reset } = useStrategyStore();
    const [selectedKeyword, setSelectedKeyword] = useState<string | null>(currentStrategy?.kosResults[0]?.keyword || null);

    const handleGeneratePost = async (task: string, payload: object, description: string) => {
        const toastId = toast.loading(`${description} 초고를 생성 중입니다...`);
        try {
            const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task, payload }) });
            if (!res.ok) throw new Error((await res.json()).error);
            const post = await res.json();
            console.log("생성된 초고:", post);
            toast.success("초고 생성이 완료되었습니다!", { id: toastId, description: "다음 단계에서 확인하십시오." });
        } catch (err: any) { toast.error(`초고 생성 오류: ${err.message}`, { id: toastId }); }
    };
    
    const handleSaveStrategy = async () => {
        if (!currentStrategy) return toast.error("저장할 데이터가 없습니다.");
        const toastId = toast.loading("전략을 저장하는 중...");
        try {
            const res = await fetch('/api/strategies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(currentStrategy) });
            if (!res.ok) throw new Error((await res.json()).error);
            const { id } = await res.json();
            setCurrentStrategy({ ...currentStrategy, id });
            toast.success("전략이 성공적으로 저장되었습니다!", { id: toastId });
        } catch (err: any) { toast.error(`전략 저장 오류: ${err.message}`, { id: toastId });}
    };

    if (!currentStrategy) return null;

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-12 animate-fade-in">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={reset}><ArrowLeft className="mr-2 h-4 w-4" />새로운 분석</Button>
                <Button onClick={handleSaveStrategy}><Save className="mr-2 h-4 w-4" />{currentStrategy.id ? '전략 업데이트' : '이 전략 저장'}</Button>
            </div>
            <section>
                <CardTitle className="flex items-center text-2xl mb-4"><Rocket className="mr-3 h-7 w-7 text-red-500" />기회의 신탁: 핵심 기회 분석</CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{currentStrategy.kosResults.map((item) => <Card key={item.keyword} onClick={() => setSelectedKeyword(item.keyword)} className={`p-4 cursor-pointer transition-all ${selectedKeyword === item.keyword ? 'border-primary ring-2 ring-primary shadow-xl' : 'hover:shadow-md'}`}><div className="flex justify-between"><h3 className="font-bold text-lg">{item.keyword}</h3><Badge>{item.kosScore}점</Badge></div><p className="text-sm text-muted-foreground mt-2">{item.explanation}</p></Card>)}</div>
            </section>
            {currentStrategy.strategyDetails && <>
                <section>
                    <CardTitle className="flex items-center text-2xl mb-4"><Library className="mr-3 h-7 w-7 text-blue-500" />구조의 베틀: 콘텐츠 설계도</CardTitle>
                    <div className="space-y-4">{currentStrategy.strategyDetails.topicClusters.map((c) => (<div key={c.mainTopic} className="p-4 border rounded-lg"><h4 className="font-medium text-lg mb-3">{c.mainTopic}</h4><div className="flex flex-wrap gap-2">{c.subTopics.map((st) => (<Button key={st} variant="outline" size="sm" onClick={() => handleGeneratePost('generateClusterPost', { mainKeyword: currentStrategy.mainKeyword, subTopic: st }, `'${st}'`)}>{st} 초고 생성</Button>))}</div></div>))}</div>
                </section>
                <section>
                    <CardTitle className="flex items-center text-2xl mb-4"><Users className="mr-3 h-7 w-7 text-purple-500" />실행의 모루: 타겟 독자 공략</CardTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{currentStrategy.strategyDetails.personas.map((p, idx) => (<Card key={p.name} className={`flex flex-col ${idx === 0 ? 'border-purple-400' : ''}`}><CardHeader className={`${idx === 0 ? 'bg-purple-50 dark:bg-purple-900/20' : ''}`}><h3 className="flex font-bold text-lg">{idx === 0 && <Target className="mr-2 h-5 w-5" />}핵심 타겟: {p.name}</h3><CardDescription>{p.description}</CardDescription></CardHeader><CardContent className="flex-grow space-y-3">{p.recommendedPosts.map((post) => (<div key={post.title} className="p-3 border rounded-md"><p className="font-medium">{post.title}</p><p className="text-sm text-blue-600 mt-1">{post.tactic}</p><Button size="sm" variant="ghost" className="w-full justify-start text-primary" onClick={() => handleGeneratePost('generatePersonaPost', { personaName: p.name, ...post }, `'${post.title}'`)}>초고 생성 →</Button></div>))}</CardContent></Card>))}</div>
                </section>
            </>}
        </div>
    );
};

// --- 결과 표시 컴포넌트 2: 경쟁사 분석 ---
const CompetitorResultDisplay: FC = () => {
    const { competitorResult, reset } = useStrategyStore();
    if (!competitorResult) return null;
    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 animate-fade-in">
            <Button variant="ghost" onClick={reset}><ArrowLeft className="mr-2 h-4 w-4" />새로운 분석 시작</Button>
            <Card>
                <CardHeader><CardTitle>경쟁사 분석 및 공략법</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div><h3 className="font-semibold text-lg mb-2">핵심 분석 및 콘텐츠 갭</h3><p className="text-muted-foreground whitespace-pre-wrap">{competitorResult.analysis}</p></div>
                    <div><h3 className="font-semibold text-lg mb-2">추천 제목</h3><ul className="list-disc list-inside space-y-1">{competitorResult.suggestedTitles.map(title => <li key={title}>{title}</li>)}</ul></div>
                    <div><h3 className="font-semibold text-lg mb-2">추천 목차 (전략적 개요)</h3><p className="text-muted-foreground whitespace-pre-wrap">{competitorResult.suggestedOutline}</p></div>
                    <Button className="w-full">이 전략으로 초고 생성</Button>
                </CardContent>
            </Card>
        </div>
    );
};

// --- 메인 제어실 ---
export default function Stage1_StrategyDraft() {
  const { savedStrategies, currentStrategy, competitorResult, isLoading, setSavedStrategies, removeSavedStrategy, setCurrentStrategy, setCompetitorResult, setLoading, reset } = useStrategyStore();
  const [strategyMode, setStrategyMode] = useState<'new' | 'competitor' | null>(null);
  const [mainKeywordInput, setMainKeywordInput] = useState('');
  const [competitorContent, setCompetitorContent] = useState('');

  useEffect(() => {
    const fetchSavedStrategies = async () => {
        try { const res = await fetch('/api/strategies'); if (!res.ok) throw new Error('저장된 목록 로딩 실패'); setSavedStrategies(await res.json()); } catch (err: any) { toast.error(err.message); }
    };
    fetchSavedStrategies();
  }, [setSavedStrategies]);

  const handleInitialAnalysis = async () => {
    if (!mainKeywordInput.trim()) return toast.error("분석할 키워드를 입력하십시오.");
    setLoading(true);
    reset();
    const toastId = toast.loading("AI가 키워드 전략을 분석 중입니다...");
    try {
        const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: 'analyzeKeywords', payload: { mainKeyword: mainKeywordInput } }) });
        if (!res.ok) throw new Error((await res.json()).error);
        const data = await res.json();
        
        const initialData: FullStrategyData = { mainKeyword: mainKeywordInput, kosResults: data.kosResults, strategyDetails: null };
        setCurrentStrategy(initialData);

        const detailsRes = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: 'generateStrategyDetails', payload: { selectedKeyword: data.kosResults[0].keyword } }) });
        if (!detailsRes.ok) throw new Error((await detailsRes.json()).error);
        const detailsData = await detailsRes.json();

        setCurrentStrategy({ ...initialData, strategyDetails: detailsData });
        toast.success("전략 분석이 완료되었습니다!", { id: toastId });
    } catch (err: any) { toast.error(`오류: ${err.message}`, { id: toastId }); reset(); } 
    finally { setLoading(false); }
  };
  
  const handleCompetitorAnalysis = async () => {
    if (!competitorContent.trim()) return toast.error("분석할 경쟁사의 글을 입력하십시오.");
    setLoading(true);
    reset();
    const toastId = toast.loading("경쟁사 콘텐츠를 분석 중입니다...");
    try {
        const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: 'analyzeCompetitor', payload: { competitorContent } }) });
        if (!res.ok) throw new Error((await res.json()).error);
        const data = await res.json();
        setCompetitorResult(data);
        toast.success("경쟁사 분석 완료!", { id: toastId });
    } catch (err: any) { toast.error(`오류: ${err.message}`, { id: toastId }); } 
    finally { setLoading(false); }
  };
  
  const handleLoadStrategy = async (strategyId: string) => {
    setLoading(true);
    reset();
    const toastId = toast.loading("저장된 전략을 불러오는 중입니다...");
    try {
        const res = await fetch(`/api/strategies?id=${strategyId}`);
        if (!res.ok) throw new Error('전략을 불러오지 못했습니다.');
        setCurrentStrategy(await res.json());
        toast.success("전략을 성공적으로 불러왔습니다.", { id: toastId });
    } catch (err: any) { toast.error(err.message, { id: toastId });} 
    finally { setLoading(false); }
  };

  const handleDeleteStrategy = async (strategyId: string, strategyName: string) => {
    if (!window.confirm(`'${strategyName}' 전략을 정말로 삭제하시겠습니까?`)) return;
    const toastId = toast.loading(`'${strategyName}' 전략을 삭제하는 중...`);
    try {
        const res = await fetch(`/api/strategies?id=${strategyId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error((await res.json()).error || "전략 삭제 실패");
        removeSavedStrategy(strategyId);
        toast.success("전략이 성공적으로 삭제되었습니다.", { id: toastId });
    } catch (err: any) { toast.error(`오류: ${err.message}`, { id: toastId }); }
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin" /><p className="mt-4">분석 중...</p></div>;
  if (currentStrategy) return <KeywordStrategyResultDisplay />;
  if (competitorResult) return <CompetitorResultDisplay />;

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-lg space-y-8">
        {!strategyMode ? (
          <>
            <Card>
                <CardHeader><CardTitle>콘텐츠 전략 수립</CardTitle><CardDescription>두 갈래의 창조의 길 중 하나를 선택하십시오.</CardDescription></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-24" onClick={() => setStrategyMode('new')}><FileText className="mr-2"/>새 아이디어로 시작</Button>
                    <Button variant="outline" className="h-24" onClick={() => setStrategyMode('competitor')}><Swords className="mr-2"/>경쟁사 분석으로 시작</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="flex items-center"><FolderClock className="mr-2"/>기억의 회랑: 저장된 전략</CardTitle></CardHeader>
                <CardContent>
                    {savedStrategies.length > 0 ? (<ul className="space-y-2">{savedStrategies.map(s => (<li key={s.id} className="flex items-center space-x-2"><Button variant="outline" className="flex-grow justify-between" onClick={() => handleLoadStrategy(s.id)}><span>{s.mainKeyword}</span><span className="text-xs text-muted-foreground">{new Date(s.updatedAt).toLocaleString()}</span></Button><Button variant="destructive" size="icon" onClick={() => handleDeleteStrategy(s.id, s.mainKeyword)}><Trash2 className="h-4 w-4"/></Button></li>))}</ul>) 
                    : (<p className="text-sm text-center text-muted-foreground">저장된 전략이 없습니다.</p>)}
                </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader><Button variant="ghost" size="sm" onClick={() => setStrategyMode(null)} className="mb-2 w-min"><ArrowLeft className="mr-2 h-4 w-4" />뒤로</Button><CardTitle>{strategyMode === 'new' ? '새로운 아이디어' : '경쟁사 분석'}</CardTitle></CardHeader>
            <CardContent>
              {strategyMode === 'new' ? (<div className="space-y-4"><Input placeholder="핵심 주제 (예: 제미나이 API)" value={mainKeywordInput} onChange={(e) => setMainKeywordInput(e.target.value)} /><Button onClick={handleInitialAnalysis} className="w-full">AI 키워드 전략 분석</Button></div>) 
              : (<div className="space-y-4"><Textarea placeholder="경쟁사 글 본문을 붙여넣으세요." className="h-48" value={competitorContent} onChange={(e) => setCompetitorContent(e.target.value)} /><Button onClick={handleCompetitorAnalysis} className="w-full">경쟁사 콘텐츠 분석</Button></div>)}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}