'use client';
import CrystalBall from '@/components/CrystalBall';
import GenerateControls from '@/components/GenerateControls';
import KeywordDisplay from '@/components/KeywordDisplay';
import MainKeywordInput from '@/components/MainKeywordInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const AiToolPanel = () => {
  return (
    // [개선] 전체 레이아웃 및 스타일 적용
    <div className="h-full bg-muted/40">
      <ScrollArea className="h-full">
        <div className="p-4">
          <CrystalBall />
          <Separator className="my-6" />
          <div>
            <h3 className="mb-4 text-lg font-semibold tracking-tight">AI 생성 도구</h3>
            <div className="space-y-4">
              <MainKeywordInput />
              <GenerateControls />
              <KeywordDisplay />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AiToolPanel;