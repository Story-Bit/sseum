// 이 파일의 기존 내용을 모두 삭제하고 아래의 완벽한 코드로 교체하십시오.

'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Wand2, ChevronsUpDown, Loader, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { callGenerativeAPI } from '@/lib/gemini';

const StyleAnalyzer = () => {
    const [userStyleText, setUserStyleText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [savedStyle, setSavedStyle] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        try {
            const storedStyle = localStorage.getItem('userStyleGuide');
            if (storedStyle) {
                setSavedStyle(storedStyle);
            }
        } catch (e) {
            console.error("localStorage 접근 오류:", e);
        }
    }, []);

    const handleAnalyzeStyle = async () => {
        if (!userStyleText.trim()) {
            toast.error('분석할 텍스트를 입력해주세요.');
            return;
        }
        setIsAnalyzing(true);
        toast.info("AI가 당신의 스타일을 분석하고 있습니다...");

        const prompt = `너는 문체 분석 전문가야. 다음 텍스트를 분석해서 이 글의 핵심적인 스타일 특징(톤, 자주 쓰는 어휘, 문장 구조, 독특한 습관 등)을 다른 AI가 모방할 수 있도록 간결한 '스타일 가이드' 형식으로 요약해 줘. 분석할 텍스트: """${userStyleText}"""`;
        const schema = { type: "OBJECT", properties: { style_guide: { type: "STRING" } }, required: ["style_guide"] };

        try {
            const result = await callGenerativeAPI(prompt, schema);
            if (result.style_guide) {
                localStorage.setItem('userStyleGuide', result.style_guide);
                setSavedStyle(result.style_guide);
                setUserStyleText('');
                toast.success('나만의 스타일 분석 및 저장이 완료되었습니다!');
            } else {
                throw new Error("API 응답에서 스타일 가이드를 찾을 수 없습니다.");
            }
        } catch (e: any) {
            toast.error(`스타일 분석 중 오류가 발생했습니다: ${e.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleClearStyle = () => {
        localStorage.removeItem('userStyleGuide');
        setSavedStyle(null);
        toast.info('저장된 스타일이 초기화되었습니다.');
    };

    return (
        <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex justify-between items-center text-left">
                <h3 className="text-sm font-bold text-white flex items-center"><Wand2 size={16} className="mr-2 text-blue-400"/> 나만의 글쓰기 스타일</h3>
                <ChevronsUpDown size={16} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div className="mt-3 animate-fade-in">
                    {savedStyle ? (
                        <div>
                            <p className="text-xs text-green-400 mb-2 font-semibold">✅ 스타일이 저장되어 자동으로 적용됩니다.</p>
                            <p className="text-xs text-gray-300 bg-gray-700 p-2 rounded-md mb-2">"{savedStyle.substring(0, 100)}..."</p>
                            <Button onClick={handleClearStyle} variant="destructive" size="sm" className="w-full text-xs">
                                <Trash2 className="mr-2 h-3 w-3" /> 저장된 스타일 초기화
                            </Button>
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-gray-400 mb-2">대표적인 글 1개를 붙여넣으면, AI가 스타일을 분석하여 초고에 반영합니다.</p>
                            <Textarea 
                                value={userStyleText} 
                                onChange={(e) => setUserStyleText(e.target.value)} 
                                rows={4} 
                                className="w-full p-2 border border-gray-600 bg-gray-800 text-gray-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500" 
                                placeholder="여기에 대표적인 블로그 글 1개의 전체 본문을 붙여넣으세요..." 
                                disabled={isAnalyzing} 
                            />
                            <div className="flex gap-2 mt-2">
                                <Button onClick={handleAnalyzeStyle} disabled={isAnalyzing || !userStyleText} className="flex-1 text-xs" size="sm">
                                    {isAnalyzing ? <Loader className="animate-spin mr-2 h-4 w-4" /> : '스타일 분석 및 저장'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default StyleAnalyzer;