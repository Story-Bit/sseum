'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ChevronLeft } from "lucide-react";

const strategySections = [
  { id: "intro", title: "Gemini 프로 기능 소개", items: ["제미니 프로 vs. 다른 모델 비교 초고 생성", "제미니 프로 사용 가이드 초고 생성", "제미니 프로 활용 팁 초고 생성", "제미니 프로 API 연동 초고 생성", "제미니 프로 가격 정책 초고 생성"] },
  { id: "applications", title: "Gemini 프로 활용 분야", items: ["자연어 처리 초고 생성", "텍스트 생성 초고 생성", "챗봇 개발 초고 생성", "기계 번역 초고 생성", "감정 분석 초고 생성", "요약 초고 생성"] },
  { id: "success-stories", title: "Gemini 프로 성공 사례", items: ["다양한 산업군 적용 사례 초고 생성", "제미니 프로로 문제 해결 초고 생성", "ROI 측정 및 효과 분석 초고 생성"] },
  { id: "future", title: "Gemini 프로의 미래", items: ["기술 발전 방향 초고 생성", "업데이트 및 개선 사항 초고 생성", "경쟁 환경 분석 초고 생성"] },
];

export default function EditorPage() {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
      <ResizablePanel defaultSize={20}>
        <div className="flex h-full flex-col p-4">
          <span className="font-semibold">첫 번째 사이드바</span>
          <p className="text-sm text-muted-foreground mt-2">콘텐츠가 여기에 표시됩니다.</p>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={25}>
        <div className="flex h-full flex-col p-4">
          <span className="font-semibold">'작업 단계' 사이드바</span>
           <p className="text-sm text-muted-foreground mt-2">콘텐츠가 여기에 표시됩니다.</p>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={55} className="flex flex-col min-w-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
            <h2 className="text-xl font-bold">전략 완성: 이제 글감을 구체화하세요.</h2>
          </div>
          <Button>전략 업데이트</Button>
        </div>
        <div className="flex-grow p-6">
          <Accordion type="single" collapsible className="w-full">
            {strategySections.map((section) => (
              <AccordionItem value={section.id} key={section.id}>
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {section.items.map((item, index) => (
                      <Button key={index} variant="outline" className="h-auto justify-start text-left font-normal whitespace-normal">
                        {item}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}