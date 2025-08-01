'use client';

import React, { useState, useCallback } from 'react';
import { useBlogStore } from '../blog-store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader, Award, Feather, BookPlus, Trash2 } from 'lucide-react';
// import { callGenerativeAPI } from '@/lib/gemini';

const CriticPanel = () => {
    const { activePost, setActivePost, setLoading } = useBlogStore();
    const [criticAnalysis, setCriticAnalysis] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleCriticAnalysis = useCallback(async () => {
        if (!activePost?.draft) { toast.error("분석할 글이 없습니다."); return; }
        setIsAnalyzing(true);
        setCriticAnalysis(null);
        try {
            const prompt = `<role>당신은 50년간 수많은 작가의 잠재력을 깨운 전설적인 평론가입니다...</role><task>...</task>[분석할 콘텐츠]\n제목: ${activePost.title}\n본문:\n${activePost.draft}`;
            const schema = { /* ... '씀39'의 평론가 스키마 ... */ };
            // const result = await callGenerativeAPI(prompt, schema);
            const result = { evaluation: { summary: "전반적으로 훌륭하나, 일부 표현이 진부합니다.", strengths: ["구조가 탄탄함"], weaknesses: ["결론이 약함"] }, refinement_suggestions: [], expansion_proposals: [] };
            setCriticAnalysis(result);
            toast.success("AI 평론가의 분석이 완료되었습니다.");
        } catch (e: any) {
            toast.error(`AI 평론가 분석 중 오류: ${e.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    }, [activePost?.draft, activePost?.title]);

    if (isAnalyzing) {
        return <div className="flex-grow flex flex-col items-center justify-center p-4"><Loader className="animate-spin text-blue-500 w-10 h-10" /><p className="mt-4 text-sm text-gray-600">50년 경력의 평론가가 글을 분석하고 있습니다...</p></div>;
    }

    if (!criticAnalysis) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                 <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4"><Award className="w-10 h-10 text-blue-600"/></div>
                 <h3 className="font-bold text-gray-800">AI 평론가의 피드백 받기</h3>
                 <p className="text-sm text-gray-500 mt-2 mb-4">버튼을 눌러 글을 분석하고<br/>개선점과 확장 포인트를 찾아보세요.</p>
                 <Button onClick={handleCriticAnalysis} disabled={!activePost?.draft}>AI 글 평가받기</Button>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            {/* 분석 결과 표시 UI */}
            <p>분석 결과가 여기에 표시됩니다.</p>
        </div>
    );
};

export default CriticPanel;