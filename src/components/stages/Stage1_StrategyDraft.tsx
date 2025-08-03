// /src/components/stages/Stage1_StrategyDraft.tsx

'use client';

import { useState, useMemo, useEffect } from 'react';
import { create } from 'zustand';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Rocket, Library, Lightbulb, Users, Target, ArrowLeft, Save, FolderClock } from 'lucide-react';
import { toast } from "sonner";

// 타입 정의
export interface KOSResult { keyword: string; kosScore: number; explanation: string; }
export interface TopicCluster { mainTopic: string; subTopics: string[]; }
export interface RecommendedPost { title: string; tactic: string; }
export interface Persona { name: string; description: string; recommendedPosts: RecommendedPost[]; }
export interface StrategyDetails { pillarContent: string; topicClusters: TopicCluster[]; personas: Persona[]; }
export interface SavedStrategy { id: string; mainKeyword: string; updatedAt: string; }
export interface FullStrategyData { id: string; mainKeyword: string; kosResults: KOSResult[]; strategyDetails: StrategyDetails; }

// 중앙 상태 관리소 (Zustand)
interface StrategyState {
  savedStrategies: SavedStrategy[];
  currentStrategy: FullStrategyData | null;
  isLoading: boolean;
  isDetailLoading: boolean;
  setSavedStrategies: (strategies: SavedStrategy[]) => void;
  setCurrentStrategy: (strategy: FullStrategyData | null) => void;
  setLoading: (type: 'main' | 'detail', status: boolean) => void;
  reset: () => void;
}

export const useStrategyStore = create<StrategyState>((set) => ({
  savedStrategies: [],
  currentStrategy: null,
  isLoading: false,
  isDetailLoading: false,
  setSavedStrategies: (strategies) => set({ savedStrategies: strategies }),
  setCurrentStrategy: (strategy) => set({ currentStrategy: strategy }),
  setLoading: (type, status) => set(type === 'main' ? { isLoading: status } : { isDetailLoading: status }),
  reset: () => set({ currentStrategy: null, isLoading: false, isDetailLoading: false }),
}));

// 메인 제어실
export default function Stage1_StrategyDraft() {
  const { savedStrategies, currentStrategy, isLoading, isDetailLoading, setSavedStrategies, setCurrentStrategy, setLoading, reset } = useStrategyStore();
  const [mainKeywordInput, setMainKeywordInput] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  useEffect(() => {
    // 컴포넌트 마운트 시 저장된 전략 목록을 자동으로 불러온다.
    const fetchSavedStrategies = async () => {
      try {
        const res = await fetch('/api/strategies');
        if (!res.ok) throw new Error('저장된 목록을 불러오지 못했습니다.');
        const data = await res.json();
        setSavedStrategies(data);
      } catch (err: any) {
        toast.error(err.message);
      }
    };
    fetchSavedStrategies();
  }, [setSavedStrategies]);
  
  // API 호출 로직들
  const handleInitialAnalysis = async () => { /* ... 이전과 동일 ... */ };
  const handleKeywordSelect = async (keyword: string) => { /* ... 이전과 동일 ... */ };
  const handleGeneratePost = async (task: string, payload: object) => { /* ... 이전과 동일 ... */ };
  const handleSaveStrategy = async () => { /* ... 이전과 동일 ... */ };

  const handleLoadStrategy = async (strategyId: string) => {
    setLoading('main', true);
    const toastId = toast.loading("저장된 전략을 불러오는 중입니다...");
    try {
        const res = await fetch(`/api/strategies?id=${strategyId}`);
        if (!res.ok) throw new Error('전략을 불러오지 못했습니다.');
        const data = await res.json();
        setCurrentStrategy(data);
        setSelectedKeyword(data.kosResults[0]?.keyword || null);
        toast.success("전략을 성공적으로 불러왔습니다.", { id: toastId });
    } catch (err: any) {
        toast.error(err.message, { id: toastId });
    } finally {
        setLoading('main', false);
    }
  };


  if (isLoading) return <div className="flex flex-col items-center justify-center h-full"><Loader2 className="h-12 w-12 animate-spin" /><p className="mt-4">전략 분석 중...</p></div>;
  
  if (currentStrategy) {
    // 결과 표시 UI (개선된 버전)
    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-12">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={reset}><ArrowLeft className="mr-2 h-4 w-4" />새로운 전략 분석</Button>
                <Button onClick={handleSaveStrategy}><Save className="mr-2 h-4 w-4" />{currentStrategy.id ? '전략 업데이트' : '이 전략 저장'}</Button>
            </div>
            {/* KOS, 클러스터, 페르소나 섹션... (UI/UX 개선 적용) */}
        </div>
    );
  }

  // 기본 입력 UI (불러오기 기능 추가)
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-lg space-y-8">
        <Card>
            <CardHeader><CardTitle>콘텐츠 전략 수립</CardTitle><CardDescription>분석할 주제를 입력하거나, 저장된 전략을 불러오세요.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
                <Input placeholder="예: 제미나이 API" value={mainKeywordInput} onChange={(e) => setMainKeywordInput(e.target.value)} />
                <Button onClick={handleInitialAnalysis} disabled={isLoading} className="w-full">AI 키워드 전략 분석</Button>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><FolderClock className="mr-2"/>기억의 회랑: 저장된 전략</CardTitle>
            </CardHeader>
            <CardContent>
                {savedStrategies.length > 0 ? (
                    <ul className="space-y-2">
                        {savedStrategies.map(s => (
                            <li key={s.id}>
                                <Button variant="outline" className="w-full justify-between" onClick={() => handleLoadStrategy(s.id)}>
                                    <span>{s.mainKeyword}</span>
                                    <span className="text-xs text-muted-foreground">{new Date(s.updatedAt).toLocaleString()}</span>
                                </Button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-center text-muted-foreground">저장된 전략이 없습니다.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}