// /src/components/stages/Stage1_StrategyDraft.tsx

'use client';

import { useState } from 'react';
import { create } from 'zustand';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Rocket, Lightbulb, Library, Users, ArrowLeft, Wand2 } from 'lucide-react';
import { toast } from "sonner";

// =================================================================================
// 1. 타입 정의
// =================================================================================
export interface KOSResult {
  keyword: string;
  kosScore: number;
  explanation: string;
}

export interface TopicCluster {
  mainTopic: string;
  subTopics: string[];
}

export interface RecommendedPost {
  title: string;
  tactic: string;
}

export interface Persona {
  name: string;
  description: string;
  recommendedPosts: RecommendedPost[];
}

export interface StrategyResult {
  kosResults: KOSResult[];
  pillarContent: string;
  topicClusters: TopicCluster[];
  personas: Persona[];
}

// =================================================================================
// 2. 중앙 상태 관리소 (Zustand)
// =================================================================================
interface StrategyState {
  strategyResult: StrategyResult | null;
  isLoading: boolean;
  error: string | null;
  setStrategyResult: (result: StrategyResult | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetStrategy: () => void;
}

const useStrategyStore = create<StrategyState>((set) => ({
  strategyResult: null,
  isLoading: false,
  error: null,
  setStrategyResult: (result) => set({ strategyResult: result, isLoading: false, error: null }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error: error, isLoading: false }),
  resetStrategy: () => set({ strategyResult: null, isLoading: false, error: null }),
}));


// =================================================================================
// 3. UI 컴포넌트
// =================================================================================

// 3.1. 결과물을 표시하는 하위 컴포넌트
const ResultDisplay = ({ strategyResult, onReset }: { strategyResult: StrategyResult; onReset: () => void; }) => (
  <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-8">
    <Button variant="ghost" onClick={onReset} className="mb-2">
      <ArrowLeft className="mr-2 h-4 w-4" />
      다시 분석하기
    </Button>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl"><Rocket className="mr-3 h-6 w-6 text-red-500" />AI 키워드 기회 점수 (KOS)</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategyResult.kosResults.map((item) => (
          <Card key={item.keyword} className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{item.keyword}</h3>
                <Badge variant={item.kosScore > 80 ? 'default' : 'secondary'}>{item.kosScore}점</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{item.explanation}</p>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>

    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center text-xl"><Lightbulb className="mr-3 h-6 w-6 text-green-500" />AI 추천 필러 콘텐츠 전략</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{strategyResult.pillarContent}</p>
        <Button className="bg-green-500 hover:bg-green-600">이 전략으로 초고 생성</Button>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl"><Library className="mr-3 h-6 w-6 text-blue-500" />주제별 키워드 클러스터</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategyResult.topicClusters.map((cluster) => (
          <div key={cluster.mainTopic} className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">{cluster.mainTopic}</h3>
            <div className="flex flex-wrap gap-2">
              {cluster.subTopics.map((subTopic) => (<Badge key={subTopic} variant="outline">{subTopic}</Badge>))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl"><Users className="mr-3 h-6 w-6 text-purple-500" />타겟 독자 및 추천 글감</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategyResult.personas.map((persona) => (
          <div key={persona.name} className="p-4 border rounded-lg space-y-3">
            <h3 className="font-bold">{persona.name}</h3>
            <p className="text-sm text-muted-foreground">{persona.description}</p>
            <div className="space-y-2 pt-2">
              {persona.recommendedPosts.map((post) => (
                   <div key={post.title} className="p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                     <p className="text-sm font-medium">{post.title}</p>
                     <p className="text-xs text-blue-600 dark:text-blue-400 mt-1"><span className="font-bold">[AI 공략 비급]</span> {post.tactic}</p>
                   </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);


// 3.2. 메인 컴포넌트
export default function Stage1_StrategyDraft() {
  const { strategyResult, isLoading, error, setStrategyResult, setIsLoading, setError, resetStrategy } = useStrategyStore();
  const [mainKeyword, setMainKeyword] = useState('');
  const [blogType, setBlogType] = useState('전문가 블로그');

  const handleAnalysis = async () => {
    if (!mainKeyword.trim()) {
      toast.error("분석할 핵심 키워드를 입력해주세요.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    const toastId = toast.loading("AI가 키워드 전략 분석을 시작했습니다...");

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainKeyword, blogType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API 서버에서 오류가 발생했습니다.');
      }

      const result = await response.json();
      setStrategyResult(result);
      toast.success("전략 분석이 완료되었습니다!", { id: toastId });

    } catch (err: any) {
      setError(err.message);
      toast.error(`오류 발생: ${err.message}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">AI가 전략을 수립하고 있습니다. 잠시만 기다려주세요...</p>
      </div>
    );
  }

  if (strategyResult) {
    return <ResultDisplay strategyResult={strategyResult} onReset={resetStrategy} />;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Wand2 className="mr-2"/>콘텐츠 전략 수립 및 초고 작성</CardTitle>
          <CardDescription>어떤 방식으로 글쓰기를 시작할까요? 목표에 맞는 전략을 선택해주세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <Input 
             placeholder="분석할 핵심 주제 또는 키워드를 입력하세요. (예: 제미나이 API)"
             value={mainKeyword}
             onChange={(e) => setMainKeyword(e.target.value)}
           />
           <Button onClick={handleAnalysis} disabled={isLoading} className="w-full">
             AI 키워드 전략 분석
           </Button>
           {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}