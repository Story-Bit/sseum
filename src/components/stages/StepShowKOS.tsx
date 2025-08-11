// /src/components/stages/StepShowKOS.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// [오류 수정] 분리된 journeyStore.ts 파일에서 상태와 타입을 가져온다.
import { useJourneyStore, KOSResult } from './journeyStore'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const animationProps = {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
    transition: { duration: 0.3 }
};

export const StepShowKOS = () => {
    const { nextStep, mainKeyword, setKosResults, kosResults, setSelectedKos } = useJourneyStore();
    const [selectedKeyword, _setSelectedKeyword] = useState<KOSResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchKOS = async (isReanalyzing = false) => {
        if (!mainKeyword) return;
        setIsLoading(true);
        if (isReanalyzing) toast.info("AI가 다른 기회를 탐색 중입니다...");
        try {
            const res = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: 'analyzeKeywords', payload: { mainKeyword } }) });
            if (!res.ok) throw new Error((await res.json()).error || "API 서버 오류");
            const data = await res.json();
            setKosResults(data.kosResults || []);
            if (data.kosResults?.length > 0) { _setSelectedKeyword(data.kosResults[0]); } 
            else { _setSelectedKeyword(null); }
        } catch (err: any) { toast.error(`키워드 분석 오류: ${err.message}`); } 
        finally { setIsLoading(false); }
    };
    
    useEffect(() => { fetchKOS(); }, [mainKeyword]);

    const handleNext = () => { if (!selectedKeyword) { toast.error("진행할 키워드를 선택해주세요."); return; } setSelectedKos(selectedKeyword); nextStep(); };

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
            <div className="flex justify-center items-center relative mb-6 flex-shrink-0">
                <div className="text-center"><h1 className="text-3xl font-bold text-harmony-indigo mb-2">탐색 완료! 가장 가능성 높은 길입니다.</h1><p className="text-lg text-harmony-indigo/70">하나의 길을 선택하여 여정을 계속하세요.</p></div>
                <Button variant="outline" onClick={() => fetchKOS(true)} disabled={isLoading} className="absolute right-0"><RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />다른 기회 탐색</Button>
            </div>
            <div className="flex-grow overflow-y-auto p-2 -mx-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kosResults.map((item: KOSResult) => (
                        <Card 
                            key={item.keyword} 
                            onClick={() => _setSelectedKeyword(item)} 
                            className={`cursor-pointer transition-all h-full flex flex-col justify-between ${selectedKeyword?.keyword === item.keyword ? 'border-inspiration-gold ring-4 ring-inspiration-gold/30' : 'hover:border-harmony-indigo/50'}`}
                        >
                            <CardHeader><div className="flex justify-between items-center"><CardTitle>{item.keyword}</CardTitle><Badge className="bg-harmony-indigo text-white">{item.kosScore}점</Badge></div></CardHeader>
                            <CardContent><p className="text-harmony-indigo/80">{item.explanation}</p></CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            <div className="mt-6 flex-shrink-0 flex justify-center">
                <Button className="w-full max-w-md bg-inspiration-gold text-harmony-indigo hover:bg-inspiration-gold/90 text-lg h-14" onClick={handleNext} disabled={!selectedKeyword}>
                    {selectedKeyword ? `'${selectedKeyword.keyword}' (으)로 결정했어요!` : "키워드를 선택해주세요"}
                </Button>
            </div>
        </motion.div>
    );
};