// /src/components/stages/StepShowKOS.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useJourneyStore, KOSResult } from './Stage1_StrategyDraft';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const animationProps = {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
    transition: { duration: 0.3 }
};

export const StepShowKOS = () => {
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
                    {/* [오류 수정 2] item의 타입을 KOSResult로 명확하게 지정 */}
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