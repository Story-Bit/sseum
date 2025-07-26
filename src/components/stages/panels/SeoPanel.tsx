'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useBlog } from '@/components/BlogContext';
import { useAuth } from '@/components/AuthContext';
import { callGenerativeAPI } from '@/lib/gemini';
import { Loader, Wand2, Sparkles, CheckCircle, X, Edit, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChecklistItem: React.FC<{
    isChecked: boolean;
    text: string;
    subtext?: string;
    onOptimize?: () => void;
    isLoading?: boolean;
}> = ({ isChecked, text, subtext, onOptimize, isLoading }) => (
    <li className="flex items-center justify-between text-sm">
        <div className="flex items-center">
            {isChecked ? <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" /> : <X className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />}
            <div>
                <span className={isChecked ? 'text-gray-800' : 'text-gray-500'}>{text}</span>
                {subtext && <span className={`block text-xs ${isChecked ? 'text-gray-600' : 'text-red-600'}`}>{subtext}</span>}
            </div>
        </div>
        {onOptimize && (
            <Button onClick={onOptimize} disabled={isLoading || isChecked} size="sm" variant="secondary" className="text-xs ml-2">
                {isLoading ? <Loader className="animate-spin h-4 w-4" /> : (isChecked ? '완료' : '자동 최적화 ✨')}
            </Button>
        )}
    </li>
);

const SeoPanel = () => {
    const { activePost, updateActivePost } = useBlog();
    const { showToast } = useAuth();
    
    const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
    const [keywordSuggestions, setKeywordSuggestions] = useState<any>(null);
    const [seoSuggestions, setSeoSuggestions] = useState<any>(null);
    const [seoChecklist, setSeoChecklist] = useState({
        keywordCount: 0, keywordDensity: 0, targetKeywordMin: 0,
        targetKeywordMax: 0, relatedKeywords: [], relatedKeywordsFound: 0,
    });

    useEffect(() => {
        if (!activePost) return;

        const mainKeyword = (activePost.mainKeyword || '').trim().toLowerCase();
        const draft = activePost.draft || '';
        
        if (!mainKeyword) {
            setSeoChecklist(prev => ({ ...prev, keywordCount: 0, keywordDensity: 0 }));
            return;
        }
        
        const words = draft.split(/\s+/).filter(Boolean);
        const totalWords = words.length;
        const keywordCount = (draft.toLowerCase().match(new RegExp(mainKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        
        const targetMin = Math.max(1, Math.floor(totalWords * 0.01));
        const targetMax = Math.max(targetMin, Math.ceil(totalWords * 0.02));
        const density = totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
        const foundRelatedKeywords = (seoChecklist.relatedKeywords || []).filter((kw: string) => draft.toLowerCase().includes(kw.toLowerCase()));

        setSeoChecklist(prev => ({
            ...prev, keywordCount, keywordDensity: density,
            targetKeywordMin: targetMin, targetKeywordMax: targetMax,
            relatedKeywordsFound: foundRelatedKeywords.length,
        }));
    }, [activePost?.draft, activePost?.mainKeyword, seoChecklist.relatedKeywords]);

    const handleKeywordSuggestion = useCallback(async () => {
        if (!activePost?.draft) { showToast("분석할 글이 없습니다.", "error"); return; }
        setIsLoading(p => ({ ...p, suggesting: true }));
        try {
            const prompt = `당신은 SEO 전문가입니다. 다음 텍스트를 분석하여 네이버 검색에 가장 효과적일 것으로 예상되는 핵심 키워드 1개와, 대체 키워드 2개를 제안해주세요. 결과는 반드시 아래 JSON 형식에 맞춰 응답해야 합니다.\n\n텍스트: """${activePost.draft}"""`;
            const schema = { type: "OBJECT", properties: { recommended_keyword: { type: "STRING" }, alternative_keywords: { type: "ARRAY", items: { type: "STRING" } } }, required: ["recommended_keyword", "alternative_keywords"] };
            const result = await callGenerativeAPI(prompt, schema);
            setKeywordSuggestions(result);
        } catch (e: any) {
            showToast(`키워드 추천 중 오류: ${e.message}`, "error");
        } finally {
            setIsLoading(p => ({ ...p, suggesting: false }));
        }
    }, [activePost?.draft, showToast]);

    const handleSeoTitleAndHashtagSuggestion = useCallback(async () => {
        if (!activePost?.mainKeyword) { showToast("먼저 핵심 키워드를 설정해주세요.", "error"); return; }
        setIsLoading(p => ({...p, generatingSeo: true}));
        try {
            const prompt = `<role>당신은 대한민국 최고의 네이버 SEO 및 블로그 콘텐츠 전략 전문가입니다.</role><task>아래 [바탕글]과 [핵심 키워드]를 완벽히 파악하여, 네이버 SEO에 최적화된 블로그 제목 5개와 해시태그 5개를 생성해주십시오.</task><process>### 제목 생성 4대 원칙\n1.  **핵심 키워드 전진 배치**: [핵심 키워드]를 제목의 맨 앞에 자연스럽게 배치합니다.\n2.  **25자 내외의 간결함**: 네이버 검색 결과에 제목이 잘리지 않고 모두 표시될 수 있도록, 띄어쓰기를 포함하여 25자 내외로 간결하게 작성합니다.\n3.  **숫자 및 클릭 유도 장치 활용**: '3가지 비법', '5분 완성', '100% 후기'처럼 구체적인 숫자를 넣어 신뢰도와 호기심을 자극합니다.\n4.  **다양한 형식 조합**: 5개의 제목을 모두 같은 형식으로 만들지 말고, 질문형, 문제 해결형, 정보 제공형, 후기형 등을 조합하여 독자의 클릭을 유도합니다.</process><output_format>결과는 반드시 지정된 JSON 형식으로만 응답해야 합니다.</output_format>\n---\n[핵심 키워드]: ${activePost.mainKeyword}\n[바탕글]\n${activePost.draft}`;
            const schema = { type: "OBJECT", properties: { titles: { type: "ARRAY", items: { type: "STRING" } }, hashtags: { type: "ARRAY", items: { type: "STRING" } } }, required: ["titles", "hashtags"] };
            const result = await callGenerativeAPI(prompt, schema);
            setSeoSuggestions(result);
        } catch (e: any) {
            showToast(`SEO 정보 생성 중 오류: ${e.message}`, "error");
        } finally {
            setIsLoading(p => ({...p, generatingSeo: false}));
        }
    }, [activePost?.draft, activePost?.mainKeyword, showToast]);

    if (!activePost) return null;

    return (
        <div className="flex-grow flex-col overflow-y-auto p-4 space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center"><KeyRound size={20} className="mr-2 text-blue-600"/> 1. 핵심 키워드 설정</h3>
                {activePost.mainKeyword ? (
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">현재 키워드: <span className="font-semibold text-blue-600 p-2 bg-blue-100 rounded-md">{activePost.mainKeyword}</span></p>
                        <Button onClick={() => { updateActivePost({ mainKeyword: '' }); setKeywordSuggestions(null); setSeoSuggestions(null); }} variant="secondary" size="sm" className="text-xs">변경</Button>
                    </div>
                ) : (
                    <>
                        <Button onClick={handleKeywordSuggestion} disabled={isLoading['suggesting']} className="w-full">
                            {isLoading['suggesting'] ? <Loader className="animate-spin mr-2"/> : <Wand2 className="mr-2"/>} AI 핵심 키워드 추천
                        </Button>
                        {keywordSuggestions && (
                            <div className="mt-4 animate-fade-in space-y-2">
                                <Button onClick={() => { updateActivePost({ mainKeyword: keywordSuggestions.recommended_keyword }); setKeywordSuggestions(null); }} className="w-full">{keywordSuggestions.recommended_keyword} (가장 추천)</Button>
                                {keywordSuggestions.alternative_keywords.map((kw: string) => (
                                    <Button key={kw} onClick={() => { updateActivePost({ mainKeyword: kw }); setKeywordSuggestions(null); }} variant="outline" className="w-full">{kw}</Button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className={`p-4 bg-blue-50/50 rounded-lg border border-blue-200 transition-opacity ${!activePost.mainKeyword ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center"><Sparkles size={20} className="mr-2 text-purple-600"/> 2. AI SEO 제목 마법사</h3>
                <Button onClick={handleSeoTitleAndHashtagSuggestion} disabled={isLoading['generatingSeo'] || !activePost.mainKeyword} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300">
                    {isLoading['generatingSeo'] ? <Loader className="animate-spin mr-2"/> : <Wand2 className="mr-2"/>} 키워드 기반 제목/해시태그 생성
                </Button>
                {seoSuggestions && (
                    <div className="mt-4 animate-fade-in space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-700">추천 제목 (클릭하여 적용)</h4>
                            <ul className="mt-2 space-y-2">
                                {seoSuggestions.titles.map((title: string) => (
                                    <li key={title}><Button onClick={() => updateActivePost({ title })} variant="outline" className="w-full text-left justify-start h-auto py-2 whitespace-normal">{title}</Button></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700">추천 해시태그</h4>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {seoSuggestions.hashtags.map((t: string) => <span key={t} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">#{t.replace(/#/g, '')}</span>)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={`p-4 bg-gray-50 rounded-lg border transition-opacity ${!activePost.mainKeyword ? 'opacity-50 pointer-events-none' : ''}`}>
                 <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center"><Edit size={20} className="mr-2 text-green-600"/> 3. 본문 키워드 최적화</h3>
                <ul className="space-y-3 mt-4">
                    <ChecklistItem isChecked={seoChecklist.keywordCount >= seoChecklist.targetKeywordMin && seoChecklist.keywordCount <= seoChecklist.targetKeywordMax} text={`키워드 밀도 1~2% 유지`} subtext={`현재 ${seoChecklist.keywordCount}회 (${seoChecklist.keywordDensity.toFixed(1)}%)`} />
                    <ChecklistItem isChecked={false} text={`연관 키워드 2개 이상 사용`} subtext={`현재 0회`} />
                </ul>
            </div>
        </div>
    );
};

export default SeoPanel;