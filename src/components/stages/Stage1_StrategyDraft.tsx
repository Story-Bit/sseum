// /src/components/stages/Stage1_StrategyDraft.tsx

'use client';

import { useState } from 'react';
import { create } from 'zustand';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { toast } from "sonner";

// 새로 제련된 StrategyForge 부품과 그것이 사용하는 핵심 타입을 import 한다.
import StrategyForge, { StrategyResult } from './StrategyForge';

// =================================================================================
// 중앙 상태 관리소 (Zustand)
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
// 메인 제어실: Stage1_StrategyDraft
// =================================================================================
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
  
  // 상태에 따라 표시할 화면을 결정
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">AI가 전략을 수립하고 있습니다. 잠시만 기다려주세요...</p>
      </div>
    );
  }

  // 결과가 있으면 '전략 제련소(StrategyForge)' 엔진을 렌더링
  if (strategyResult) {
    return <StrategyForge strategyResult={strategyResult} />;
  }

  // 기본 상태에서는 '입력 양식'을 렌더링
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Wand2 className="mr-2"/>콘텐츠 전략 수립</CardTitle>
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