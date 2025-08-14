'use client';

import { Button } from "@/components/ui/button";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ChevronRight } from "lucide-react";

const strategySections = [
    { title: "Gemini 프로 기능 소개", items: ["제미니 프로 vs. 다른 모델 비교", "사용 가이드", "활용 팁", "API 연동", "가격 정책"] },
    { title: "Gemini 프로 활용 분야", items: ["자연어 처리", "텍스트 생성", "챗봇 개발", "기계 번역", "감정 분석", "요약"] },
    { title: "Gemini 프로 성공 사례", items: ["다양한 산업군 적용 사례", "문제 해결 사례", "ROI 측정 및 효과 분석"] },
    { title: "Gemini 프로의 미래", items: ["기술 발전 방향", "업데이트 및 개선 사항", "경쟁 환경 분석"] },
];

export default function Stage1_StrategyDraft() {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
            {/* 좌측 사이드바: '작업 단계' 등 모든 관련 UI가 이 패널 안에 위치해야 함 */}
            <div className="flex h-full flex-col p-4">
                {/* '새 글 작성', '외부 글 가져오기' 등 버튼 영역 */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button variant="outline">새 글 작성</Button>
                    <Button variant="outline">외부 글 가져오기</Button>
                    <Button variant="outline">글 저장하기</Button>
                    <Button variant="outline">글 불러오기</Button>
                </div>
                {/* '작업 단계' 영역 */}
                <div className="flex-grow">
                    <h3 className="text-sm font-semibold mb-2">작업 단계</h3>
                    <div className="space-y-1">
                        <Button variant="secondary" className="w-full justify-start">1. 전략 & 초고</Button>
                        <Button variant="ghost" className="w-full justify-start">2. AI 퇴고</Button>
                        <Button variant="ghost" className="w-full justify-start">3. 발행 & 활용</Button>
                    </div>
                </div>
                {/* '나만의 글쓰기 스타일' 영역 */}
                <div>
                    <Button variant="ghost" className="w-full justify-between">
                        나만의 글쓰기 스타일
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={75} className="flex flex-col">
            {/* 중앙 콘텐츠 패널 */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold">전략 완성: 이제 글감을 구체화하세요.</h2>
                <Button>전략 업데이트</Button>
            </div>
            <div className="flex-grow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {strategySections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="space-y-3">
                            <h3 className="text-lg font-semibold border-b pb-2">{section.title}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {section.items.map((item, itemIndex) => (
                                    <button key={itemIndex} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-center text-sm transition-colors">
                                        {item} 초고 생성
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ResizablePanel>
    </ResizablePanelGroup>
  );
}