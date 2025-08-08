// /src/components/stages/Stage1_StrategyDraft.tsx

'use client';

import { useState, useEffect, FC } from 'react';
import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import { JourneyProgressBar } from '@/components/ui/JourneyProgressBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Swords, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// --- 타입 정의 ---
export interface KOSResult { keyword: string; kosScore: number; explanation: string; }

// --- 신규 중앙 상태 관리소 (Zustand) ---
interface JourneyState {
  step: number;
  totalSteps: number;
  strategyMode: 'new' | 'competitor' | null;
  isLoading: boolean;
  mainKeyword: string;
  kosResults: KOSResult[];
  
  nextStep: () => void;
  prevStep: () => void;
  setStrategyMode: (mode: 'new' | 'competitor' | null) => void;
  setLoading: (status: boolean) => void;
  setMainKeyword: (keyword: string) => void;
  setKosResults: (results: KOSResult[]) => void;
  reset: () => void;
}

export const useJourneyStore = create<JourneyState>((set) => ({
  step: 1,
  totalSteps: 4,
  strategyMode: null,
  isLoading: false,
  mainKeyword: '',
  kosResults: [],
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, state.totalSteps) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  setStrategyMode: (mode) => set({ strategyMode: mode }),
  setLoading: (status) => set({ isLoading: status }),
  setMainKeyword: (keyword) => set({ mainKeyword: keyword }),
  setKosResults: (results) => set({ kosResults: results }),
  reset: () => set({ step: 1, strategyMode: null, mainKeyword: '', kosResults: [], isLoading: false }),
}));

// --- 단계별 화면 컴포넌트 ---
const animationProps = {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
    transition: { duration: 0.3 }
};

const StepSelectPath: FC = () => {
    const { nextStep, setStrategyMode } = useJourneyStore();
    const handleSelect = (mode: 'new' | 'competitor') => { setStrategyMode(mode); nextStep(); }
    
    return (
        <motion.div key="step1" {...animationProps} className="w-full max-w-lg">
            <h1 className="text-3xl font-bold text-center text-harmony-indigo">시작해볼까요?</h1>
            <p className="text-center text-lg mt-2 text-harmony-indigo/70">어떤 방식으로 글쓰기의 여정을 떠나볼까요?</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-32 text-lg bg-white/50" onClick={() => handleSelect('new')}><FileText className="mr-2"/>새 아이디어로 시작</Button>
                <Button variant="outline" className="h-32 text-lg bg-white/50" onClick={() => handleSelect('competitor')}><Swords className="mr-2"/>경쟁사 분석으로 시작</Button>
            </div>
        </motion.div>
    );
};

const StepEnterData: FC = () => {
    const { nextStep, strategyMode, mainKeyword, setMainKeyword } = useJourneyStore();
    const [competitorContent, setCompetitorContent] = useState('');

    const handleNext = () => {
        const isNewMode = strategyMode === 'new';
        if (isNewMode && !mainKeyword.trim()) return toast.error("주제를 입력해야 합니다.");
        if (!isNewMode && !competitorContent.trim()) return toast.error("경쟁사 글을 입력해야 합니다.");
        nextStep();
    }

    return (
        <motion.div key="step2" {...animationProps} className="w-full max-w-lg">
            <h1 className="text-3xl font-bold text-center text-harmony-indigo">{strategyMode === 'new' ? "어떤 주제에 대해 글을 쓸까요?" : "경쟁자의 글을 알려주세요."}</h1>
            <div className="mt-8">
                {strategyMode === 'new' ? (
                    <Input placeholder="예: 제미나이 API" className="text-center text-xl h-14" value={mainKeyword} onChange={(e) => setMainKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleNext()} />
                ) : (
                    <Textarea placeholder="경쟁사의 글 본문을 여기에 붙여넣으세요." className="h-48 text-base" value={competitorContent} onChange={(e) => setCompetitorContent(e.target.value)} />
                )}
                <Button className="w-full mt-4 bg-inspiration-gold text-harmony-indigo text-lg h-12" onClick={handleNext}>좋아요, 분석해주세요!</Button>
            </div>
        </motion.div>
    );
};

const StepShowKOS: FC = () => {
    const { nextStep, mainKeyword, setKosResults, kosResults } = useJourneyStore();
    const [selectedKeyword, setSelectedKeyword] = useState<KOSResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchKOS = async () => {
            if (!mainKeyword) return;
            setIsLoading(true);
            try {
                const res = await fetch('/api/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ task: 'analyzeKeywords', payload: { mainKeyword } })
                });
                if (!res.ok) throw new Error((await res.json()).error || "API 서버 오류");
                const data = await res.json();
                setKosResults(data.kosResults || []);
                if (data.kosResults?.length > 0) {
                    setSelectedKeyword(data.kosResults[0]);
                }
            } catch (err: any) {
                toast.error(`키워드 분석 오류: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchKOS();
    }, [mainKeyword, setKosResults]);

    const handleNext = () => {
        if (!selectedKeyword) {
            toast.error("진행할 키워드를 하나 선택해주세요.");
            return;
        }
        nextStep();
    }

    if (isLoading) {
        return (
            <motion.div key="step3-loading" {...animationProps} className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-inspiration-gold mx-auto" />
                <h1 className="text-3xl font-bold text-center text-harmony-indigo mt-4">AI가 기회의 땅을 탐색 중입니다...</h1>
            </motion.div>
        );
    }

    return (
        <motion.div key="step3" {...animationProps} className="w-full max-w-5xl h-full flex flex-col">
            <h1 className="text-3xl font-bold text-center text-harmony-indigo mb-2">탐색 완료! 가장 가능성 높은 길입니다.</h1>
            <p className="text-center text-lg mt-2 text-harmony-indigo/70 mb-6">하나의 길을 선택하여 여정을 계속하세요.</p>
            
            <div className="flex-grow overflow-y-auto p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kosResults.map((item: KOSResult) => (
                        <Card 
                            key={item.keyword} 
                            onClick={() => setSelectedKeyword(item)} 
                            className={`cursor-pointer transition-all ${selectedKeyword?.keyword === item.keyword ? 'border-inspiration-gold ring-4 ring-inspiration-gold/30' : 'hover:border-harmony-indigo/50'}`}
                        >
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>{item.keyword}</CardTitle>
                                    <Badge className="bg-harmony-indigo text-white">{item.kosScore}점</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-harmony-indigo/80">{item.explanation}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            
            <div className="mt-6 flex justify-center">
                <Button 
                    className="w-full max-w-md bg-inspiration-gold text-harmony-indigo hover:bg-inspiration-gold/90 text-lg h-14" 
                    onClick={handleNext}
                    disabled={!selectedKeyword}
                >
                    {selectedKeyword ? `'${selectedKeyword.keyword}' (으)로 결정했어요!` : "키워드를 선택해주세요"}
                </Button>
            </div>
        </motion.div>
    );
};

// --- 메인 제어실 ---
export default function Stage1_StrategyDraft() {
  const { step, totalSteps, isLoading, prevStep } = useJourneyStore();

  const renderStep = () => {
    switch(step) {
      case 1: return <StepSelectPath />;
      case 2: return <StepEnterData />;
      case 3: return <StepShowKOS />;
      // case 4: return <StepShowStrategyDetails />;
      default: return <StepSelectPath />;
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center p-8 bg-warm-white relative overflow-hidden">
      <JourneyProgressBar currentStep={step} totalSteps={totalSteps} />
      {step > 1 && !isLoading && (
        <Button variant="ghost" onClick={prevStep} className="absolute top-8 left-8 text-harmony-indigo/70">
          <ArrowLeft className="mr-2 h-4 w-4" />
          이전으로
        </Button>
      )}
      <AnimatePresence mode="wait">
        {isLoading ? <Loader2 className="h-16 w-16 animate-spin text-inspiration-gold" /> : renderStep()}
      </AnimatePresence>
    </div>
  );
}